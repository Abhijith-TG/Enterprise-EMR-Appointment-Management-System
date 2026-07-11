import { Patient } from "../models/patient.model.js";
import { generatePatientId } from "../utils/generatePatientId.js";
import { ApiError } from "../utils/apiError.js";

export const patientService = {

    createPatient: async (data: any) => {

        const patientId = await generatePatientId();

        const patient = await Patient.create({

            patientId,

            ...data

        });

        return patient;

    },

    getPatients: async (page?: number, limit?: number) => {
        if (page && limit) {
            const skip = (page - 1) * limit;
            const [patients, total] = await Promise.all([
                Patient.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
                Patient.countDocuments(),
            ]);
            return {
                patients,
                meta: { page, limit, total, totalPages: Math.ceil(total / limit) }
            };
        }
        return await Patient.find().sort({ createdAt: -1 });
    },

    getPatientById: async (id: string) => {

        const patient = await Patient.findById(id);

        if (!patient) {
            throw new ApiError(
                404,
                "Patient not found"
            );
        }

        return patient;

    },

    updatePatient: async (
        id: string,
        data: any
    ) => {

        const patient = await Patient.findByIdAndUpdate(
            id,
            data,
            {
                new: true
            }
        );

        if (!patient) {
            throw new ApiError(
                404,
                "Patient not found"
            );
        }

        return patient;

    },

    searchPatients: async (q: string) => {

        return await Patient.find({

            $or: [

                {
                    patientId: {
                        $regex: q,
                        $options: "i"
                    }
                },

                {
                    firstName: {
                        $regex: q,
                        $options: "i"
                    }
                },

                {
                    lastName: {
                        $regex: q,
                        $options: "i"
                    }
                },

                {
                    mobile: {
                        $regex: q,
                        $options: "i"
                    }
                }

            ]

        });

    }

};