import { useState, type FormEvent } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // TODO: call auth API
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        id="register-name"
        label="Full Name"
        type="text"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <Input
        id="register-email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        id="register-password"
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit">Create Account</Button>
    </form>
  );
}
