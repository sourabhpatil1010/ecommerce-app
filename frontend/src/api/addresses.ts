import { apiClient } from "./client";
import { Address, AddressCreate, AddressUpdate } from "@/types/address";

export const getAddresses = () => {
  return apiClient.get<Address[]>("/addresses/");
};

export const createAddress = (data: AddressCreate) => {
  return apiClient.post<Address>("/addresses/", data);
};

export const updateAddress = (id: string, data: AddressUpdate) => {
  return apiClient.put<Address>(`/addresses/${id}`, data);
};

export const deleteAddress = (id: string) => {
  return apiClient.delete(`/addresses/${id}`);
};

export const setDefaultAddress = (id: string) => {
  return apiClient.put<Address>(`/addresses/${id}/default`);
};
