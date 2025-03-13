
import { supabase } from "@/utils/supabase/client";
import { GeneratedCertificateDTO } from "../../dto/CertificateDTO";
import { RecipientDTO } from "../../dto/RecipientDTO";

export const createCertificate = async (certificate: GeneratedCertificateDTO) => {
  const { data, error } = await supabase.from("Certificates").insert([certificate]);
  if (error) throw error;
  return data;
};

export const createRecipient = async (recipient: RecipientDTO) => {
  const { data, error } = await supabase.from("Recipients").insert([recipient]);
  if (error) throw error;
  return data;
};

export const createGeneratedCertificate = async (generatedCertificate: GeneratedCertificateDTO) => {
  const { data, error } = await supabase.from("GeneratedCertificates").insert([generatedCertificate]);
  if (error) throw error;
  return data;
};