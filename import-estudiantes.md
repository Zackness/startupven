# Script de Importación Masiva de Estudiantes
Proyecto: Carga de matrícula 2025-2
Modelo: User (Prisma)

## 🎯 Objetivo

Importar estudiantes desde `estudiantes_matricula_20252.md` al modelo `User` evitando duplicados.

Condiciones:

- No repetir estudiantes ya existentes (comparación por nombre completo o nombre + apellido).
- Email ficticio: `nombreapellido@gmail.com` (si existe, se agrega expediente).
- Contraseña temporal: `123456`
- Role: CLIENTE, Gremio: ESTUDIANTIL
- Guardar:
  - cedula
  - expediente
  - primerNombre
  - segundoNombre
  - primerApellido
  - segundoApellido
  - name (Nombre completo normalizado)

---

## Cómo ejecutar

```bash
npx tsx scripts/import-estudiantes.ts
```

El script lee `estudiantes_matricula_20252.md`, omite duplicados (nombre completo o nombre + apellido) e inserta el resto.

## 📦 Dependencias

El proyecto ya incluye `bcryptjs`. No hace falta instalar nada extra.

```bash
# Opcional, si no estuviera:
# npm install bcryptjs
```
