import * as z from "zod";
import { UserRole, Gremio } from "@/lib/generated/prisma/enums";

// Alineados con los enums de Prisma
export const UserRoleSchema = z.nativeEnum(UserRole);
export const UserGremioSchema = z.nativeEnum(Gremio);

export const SettingsSchema = z.object ({
    name: z.optional(z.string()),
    phone: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    role: UserRoleSchema,
    email: z.optional(z.string().email({
        message: "Por favor, ingresa un correo electrónico válido"
    })),
    password: z.optional(z.string().min(6, {
        message: "La contraseña debe tener al menos 6 caracteres"
    })),
    newPassword: z.optional(z.string().min(6, {
        message: "La nueva contraseña debe tener al menos 6 caracteres"
    })),
})
    .refine((data) => {
        if (data.password && !data.newPassword) {
            return false;
        }

        return true;
    }, {
        message: "La nueva contraseña es requerida",
        path: ["newPassword"]
    })

    .refine((data) => {
        if (data.newPassword && !data.password) {
            return false;
        }

        return true;
    }, {
        message: "La contraseña es requerida",
        path: ["password"]
    })

export const NewPasswordSchema = z.object ({
    password: z.string().min(6, {
        message: "La contraseña debe tener al menos 6 caracteres"
    }),
});

export const ResetSchema = z.object ({
    email: z.string().email({
        message: "Por favor, coloca un correo electronico"
    }),
});

export const LoginSchema = z.object ({
    email: z.string().email({
        message: "Por favor, coloca un correo electronico"
    }),
    password: z.string().min(1, {
        message: "Por favor, ingresa una contraseña valida"
    }),
    code: z.optional(z.string()),
});

export const RegisterSchema = z.object ({
    email: z.string().email({
        message: "Por favor, coloca un correo electronico"
    }),
    password: z.string().min(6, {
        message: "La contraseña debe tener al menos 6 caracteres"
    }),
    name: z.string().min(1, {
        message: "Es necesario un nombre de usuario"
    }),
});
