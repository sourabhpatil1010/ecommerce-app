"""Payment service — Stripe and Razorpay integrations."""

import uuid
import logging
import json

import stripe
import razorpay
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.models.payment import Payment
from app.repositories.payment import PaymentRepository
from app.repositories.order import OrderRepository
from app.core.exceptions import BadRequestException, NotFoundException

logger = logging.getLogger(__name__)


class PaymentService:
    """Business logic for payment processing via Stripe."""

    def __init__(self, session: AsyncSession):
        self.payment_repo = PaymentRepository(session)
        self.order_repo = OrderRepository(session)
        stripe.api_key = settings.STRIPE_SECRET_KEY

    async def create_payment_intent(
        self, order_id: uuid.UUID, user_id: uuid.UUID
    ) -> dict:
        """Create a Stripe PaymentIntent for the given order.

        Returns dict with payment_id, client_secret, amount, currency.
        """
        # 1. Fetch order and validate ownership
        order = await self.order_repo.get_order_by_id_and_user_id(order_id, user_id)
        if not order:
            raise NotFoundException(detail="Order not found")

        # 2. Check order is in a payable state
        if order.status not in ("pending", "pending_payment"):
            raise BadRequestException(
                detail=f"Order is not eligible for payment (status: {order.status})"
            )

        # 3. Check for existing payment
        existing_payment = await self.payment_repo.get_by_order_id(order_id)
        if existing_payment:
            if existing_payment.status == "succeeded":
                raise BadRequestException(detail="Order is already paid")
            # If existing payment is pending or failed, reuse or create new
            if existing_payment.status == "pending" and existing_payment.provider_payment_id:
                # Return the existing client secret by retrieving the PI
                try:
                    pi = stripe.PaymentIntent.retrieve(
                        existing_payment.provider_payment_id
                    )
                    if pi.status in ("requires_payment_method", "requires_confirmation", "requires_action"):
                        return {
                            "payment_id": existing_payment.id,
                            "client_secret": pi.client_secret,
                            "amount": float(existing_payment.amount),
                            "currency": existing_payment.currency,
                        }
                except stripe.StripeError:
                    pass  # Fall through to create a new one

            # Mark old payment as cancelled before creating a new one
            existing_payment.status = "cancelled"
            await self.payment_repo.session.flush()

        # 4. Convert amount to cents for Stripe
        amount_cents = int(round(float(order.total_amount) * 100))

        # 5. Create Stripe PaymentIntent
        try:
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency="usd",
                metadata={
                    "order_id": str(order_id),
                    "user_id": str(user_id),
                },
                automatic_payment_methods={"enabled": True},
            )
        except stripe.StripeError as e:
            logger.error("Stripe PaymentIntent creation failed: %s", e)
            raise BadRequestException(
                detail="Payment processing is temporarily unavailable. Please try again."
            )

        # 6. Store local Payment record
        payment = Payment(
            order_id=order_id,
            amount=float(order.total_amount),
            currency="USD",
            status="pending",
            provider="stripe",
            provider_payment_id=intent.id,
        )
        await self.payment_repo.create(payment)

        # 7. Update order status to pending_payment
        order.status = "pending_payment"
        await self.order_repo.session.flush()

        return {
            "payment_id": payment.id,
            "client_secret": intent.client_secret,
            "amount": float(payment.amount),
            "currency": payment.currency,
        }

    async def get_payment_status(
        self, order_id: uuid.UUID, user_id: uuid.UUID
    ) -> Payment:
        """Get payment status for an order belonging to the user."""
        # Verify order ownership
        order = await self.order_repo.get_order_by_id_and_user_id(order_id, user_id)
        if not order:
            raise NotFoundException(detail="Order not found")

        payment = await self.payment_repo.get_by_order_id(order_id)
        if not payment:
            raise NotFoundException(detail="No payment found for this order")

        return payment

    async def handle_webhook_event(self, payload: bytes, sig_header: str) -> None:
        """Process a Stripe webhook event.

        Verifies signature, then handles payment_intent.succeeded and
        payment_intent.payment_failed events.
        """
        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            logger.warning("Stripe webhook: invalid payload")
            raise BadRequestException(detail="Invalid payload")
        except stripe.SignatureVerificationError:
            logger.warning("Stripe webhook: invalid signature")
            raise BadRequestException(detail="Invalid signature")

        event_type = event["type"]
        data_object = event["data"]["object"]

        logger.info("Stripe webhook received: %s", event_type)

        if event_type == "payment_intent.succeeded":
            await self._handle_payment_succeeded(data_object)
        elif event_type == "payment_intent.payment_failed":
            await self._handle_payment_failed(data_object)
        else:
            logger.info("Unhandled Stripe event type: %s", event_type)

    async def _handle_payment_succeeded(self, payment_intent: dict) -> None:
        """Mark payment and order as successful."""
        pi_id = payment_intent["id"]
        payment = await self.payment_repo.get_by_provider_payment_id(pi_id)
        if not payment:
            logger.warning("Webhook: no payment found for PI %s", pi_id)
            return

        payment.status = "succeeded"

        # Update order status
        order = await self.order_repo.get_by_id(payment.order_id)
        if order:
            order.status = "pending"  # Confirmed — ready for processing
        await self.payment_repo.session.flush()

        logger.info(
            "Payment %s succeeded for order %s", payment.id, payment.order_id
        )

    async def _handle_payment_failed(self, payment_intent: dict) -> None:
        """Mark payment as failed."""
        pi_id = payment_intent["id"]
        payment = await self.payment_repo.get_by_provider_payment_id(pi_id)
        if not payment:
            logger.warning("Webhook: no payment found for PI %s", pi_id)
            return

        payment.status = "failed"

        # Update order status
        order = await self.order_repo.get_by_id(payment.order_id)
        if order:
            order.status = "payment_failed"
        await self.payment_repo.session.flush()

        logger.info(
            "Payment %s failed for order %s", payment.id, payment.order_id
        )

    async def simulate_payment_update(self, order_id: uuid.UUID, success: bool) -> None:
        """Simulate webhook status updates for testing/development."""
        payment = await self.payment_repo.get_by_order_id(order_id)
        if not payment:
            # Create a dummy payment if it doesn't exist yet
            order = await self.order_repo.get_by_id(order_id)
            if not order:
                raise NotFoundException(detail="Order not found")
            payment = Payment(
                order_id=order_id,
                amount=float(order.total_amount),
                currency="USD",
                status="pending",
                provider="stripe_simulated",
                provider_payment_id="pi_simulated_" + str(uuid.uuid4())[:8],
            )
            await self.payment_repo.create(payment)
            order.status = "pending_payment"
            await self.order_repo.session.flush()

        if success:
            payment.status = "succeeded"
            order = await self.order_repo.get_by_id(payment.order_id)
            if order:
                order.status = "pending"
        else:
            payment.status = "failed"
            order = await self.order_repo.get_by_id(payment.order_id)
            if order:
                order.status = "payment_failed"
        
        await self.payment_repo.session.flush()

    async def create_razorpay_order(
        self, order_id: uuid.UUID, user_id: uuid.UUID
    ) -> dict:
        """Create a Razorpay order for the given local order."""
        # 1. Fetch order and validate ownership
        order = await self.order_repo.get_order_by_id_and_user_id(order_id, user_id)
        if not order:
            raise NotFoundException(detail="Order not found")

        # 2. Check order is in a payable state
        if order.status not in ("pending", "pending_payment"):
            raise BadRequestException(
                detail=f"Order is not eligible for payment (status: {order.status})"
            )

        # 3. Check for existing payment
        existing_payment = await self.payment_repo.get_by_order_id(order_id)
        if existing_payment:
            if existing_payment.status == "succeeded":
                raise BadRequestException(detail="Order is already paid")
            # Delete old payment record to avoid unique constraints or duplicate states
            await self.payment_repo.delete(existing_payment)

        # 4. Convert amount to INR (with subunits/paise)
        conversion_rate = settings.RAZORPAY_CURRENCY_CONVERSION_RATE
        amount_inr = float(order.total_amount) * conversion_rate
        amount_paise = int(round(amount_inr * 100))

        # 5. Create Razorpay Order
        try:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            razorpay_order = client.order.create({
                "amount": amount_paise,
                "currency": "INR",
                "receipt": str(order_id),
                "notes": {
                    "order_id": str(order_id),
                    "user_id": str(user_id)
                }
            })
            razorpay_order_id = razorpay_order["id"]
        except Exception as e:
            logger.error("Razorpay order creation failed: %s", e)
            raise BadRequestException(
                detail="Razorpay payment initialization failed. Please try again."
            )

        # 6. Store local Payment record
        payment = Payment(
            order_id=order_id,
            amount=amount_inr,
            currency="INR",
            status="pending",
            provider="razorpay",
            provider_payment_id=razorpay_order_id,
        )
        await self.payment_repo.create(payment)

        # 7. Update order status to pending_payment
        order.status = "pending_payment"
        await self.order_repo.session.flush()

        return {
            "payment_id": payment.id,
            "razorpay_order_id": razorpay_order_id,
            "amount": amount_paise,
            "currency": "INR",
            "razorpay_key_id": settings.RAZORPAY_KEY_ID,
        }

    async def verify_razorpay_payment(
        self,
        razorpay_payment_id: str,
        razorpay_order_id: str,
        razorpay_signature: str,
    ) -> bool:
        """Verify the signature returned by Razorpay checkout modal."""
        payment = await self.payment_repo.get_by_provider_payment_id(razorpay_order_id)
        if not payment:
            raise NotFoundException(detail="Payment record not found")

        order = await self.order_repo.get_by_id(payment.order_id)
        if not order:
            raise NotFoundException(detail="Order not found")

        if payment.status == "succeeded":
            return True

        try:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            client.utility.verify_payment_signature({
                'razorpay_order_id': razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature': razorpay_signature
            })
        except Exception as e:
            logger.warning("Razorpay payment verification failed: %s", e)
            raise BadRequestException(detail="Payment signature verification failed")

        payment.status = "succeeded"
        order.status = "pending"
        await self.payment_repo.session.flush()
        logger.info("Razorpay payment verified successfully for order %s", order.id)
        return True

    async def fail_razorpay_payment(self, razorpay_order_id: str) -> None:
        """Mark Razorpay payment and order as failed."""
        payment = await self.payment_repo.get_by_provider_payment_id(razorpay_order_id)
        if not payment:
            logger.warning("Fail checkout: no payment found for order ID %s", razorpay_order_id)
            return

        payment.status = "failed"
        order = await self.order_repo.get_by_id(payment.order_id)
        if order:
            order.status = "payment_failed"
        await self.payment_repo.session.flush()
        logger.info("Razorpay payment marked as failed for order %s", payment.order_id)

    async def handle_razorpay_webhook_event(self, payload: bytes, sig_header: str) -> None:
        """Process an incoming Razorpay webhook event."""
        try:
            client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))
            client.utility.verify_webhook_signature(
                payload.decode("utf-8"),
                sig_header,
                settings.RAZORPAY_WEBHOOK_SECRET
            )
        except Exception as e:
            logger.warning("Razorpay webhook signature verification failed: %s", e)
            raise BadRequestException(detail="Invalid webhook signature")

        try:
            data = json.loads(payload.decode("utf-8"))
        except Exception:
            raise BadRequestException(detail="Invalid JSON payload")

        event = data.get("event")
        payment_entity = data.get("payload", {}).get("payment", {}).get("entity", {})
        razorpay_order_id = payment_entity.get("order_id")

        if not razorpay_order_id:
            logger.info("Razorpay webhook: Event %s contains no order_id", event)
            return

        logger.info("Razorpay webhook received: %s for order %s", event, razorpay_order_id)

        payment = await self.payment_repo.get_by_provider_payment_id(razorpay_order_id)
        if not payment:
            logger.warning("Razorpay webhook: no payment record found for order %s", razorpay_order_id)
            return

        order = await self.order_repo.get_by_id(payment.order_id)

        if event in ("payment.captured", "order.paid"):
            payment.status = "succeeded"
            if order:
                order.status = "pending"
        elif event == "payment.failed":
            payment.status = "failed"
            if order:
                order.status = "payment_failed"

        await self.payment_repo.session.flush()

