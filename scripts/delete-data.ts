import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import * as readline from "readline";

// Helper to create DB connection (copied from lib/db.ts but simplified for script)
function createPrismaClient() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error("Falta DATABASE_URL en el entorno.");
    }

    const url = new URL(databaseUrl);
    const database = url.pathname.replace(/^\//, "");

    const adapter = new PrismaMariaDb({
        host: url.hostname,
        port: url.port ? Number(url.port) : 3306,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database,
    });

    return new PrismaClient({ adapter });
}

const prisma = createPrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function ask(question: string): Promise<string> {
    return new Promise((resolve) => rl.question(question, resolve));
}

async function listTypes() {
    const types = await prisma.ticketType.findMany({
        include: { _count: { select: { tickets: true } } },
        orderBy: { name: "asc" },
    });

    console.log("\nTrying to list types...");
    console.log("------------------------------------------------");
    console.log("ID                                   | Nombre           | Tickets Asociados");
    console.log("------------------------------------------------");
    if (types.length === 0) {
        console.log("No hay tipos de ticket.");
    }
    types.forEach((t) => {
        console.log(`${t.id.padEnd(36)} | ${t.name.padEnd(16)} | ${t._count.tickets}`);
    });
    console.log("------------------------------------------------\n");
    return types;
}

async function deleteType(id: string) {
    try {
        // Primero borrar tickets asociados debido a onDelete: Restrict
        const deletedTickets = await prisma.ticket.deleteMany({
            where: { ticketTypeId: id },
        });
        console.log(`Eliminados ${deletedTickets.count} tickets asociados.`);

        const deletedType = await prisma.ticketType.delete({
            where: { id },
        });
        console.log(`Tipo de ticket eliminad: ${deletedType.name}`);
    } catch (error) {
        console.error("Error al eliminar:", error);
    }
}

async function deleteAll() {
    try {
        const confirm = await ask("¿Estás seguro de querer eliminar TODOS los tickets y tipos? (escribe mentalmente 'si'): ");
        if (confirm.toLowerCase() !== "si") {
            console.log("Cancelado.");
            return;
        }

        console.log("Eliminando todos los tickets...");
        const tickets = await prisma.ticket.deleteMany({});
        console.log(`Eliminados ${tickets.count} tickets.`);

        console.log("Eliminando todos los tipos de ticket...");
        const types = await prisma.ticketType.deleteMany({});
        console.log(`Eliminados ${types.count} tipos.`);
    } catch (error) {
        console.error("Error al eliminar todo:", error);
    }
}

async function main() {
    console.log("=== Script de Limpieza de Base de Datos ===");

    while (true) {
        console.log("\nOpciones:");
        console.log("1. Listar tipos de ticket");
        console.log("2. Eliminar un tipo específico (y sus tickets)");
        console.log("3. Eliminar TODO (Tickets y Tipos)");
        console.log("4. Salir");

        const answer = await ask("\nElige una opción: ");

        switch (answer) {
            case "1":
                await listTypes();
                break;
            case "2":
                const types = await listTypes();
                if (types.length > 0) {
                    const id = await ask("Introduce el ID del tipo a eliminar (o cancelar): ");
                    if (id && types.find(t => t.id === id)) {
                        await deleteType(id);
                    } else {
                        console.log("ID no válido o cancelado.");
                    }
                }
                break;
            case "3":
                await deleteAll();
                break;
            case "4":
                console.log("Saliendo...");
                rl.close();
                await prisma.$disconnect();
                return;
            default:
                console.log("Opción no válida.");
        }
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
