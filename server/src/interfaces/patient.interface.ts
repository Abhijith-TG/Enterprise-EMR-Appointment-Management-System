export interface IPatient {
  patientId: string;

  firstName: string;

  lastName?: string;

  gender: "Male" | "Female" | "Other";

  dob: Date;

  mobile: string;

  email?: string;

  address?: string;

  primaryContactName?: string;

  primaryContactNumber?: string;

  relationship?: string;
}