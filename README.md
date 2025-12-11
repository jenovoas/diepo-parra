# Diepo Parra 🎯

**Aplicación Full-Stack Moderna** | Next.js | TypeScript | Prisma | PostgreSQL

Una aplicación web profesional construida con las tecnologías más modernas del ecosistema React.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)

---

## 🌟 Características Principales

- ✅ **Full-Stack TypeScript** - Type safety en todo el proyecto
- ✅ **Autenticación Segura** - Gestión de usuarios y sesiones
- ✅ **Base de Datos Integrada** - PostgreSQL con ORM Prisma
- ✅ **Interfaz Moderna** - Diseño responsivo con Tailwind CSS
- ✅ **API RESTful** - Endpoints bien documentados
- ✅ **Tests Automatizados** - Cobertura de tests con Jest
- ✅ **Arquitectura Escalable** - Estructura modular y mantenible

---

## 🚀 Quick Start

### Requisitos Previos
- Node.js 18+ 
- npm o yarn
- PostgreSQL 12+

### Instalación

```bash
# Clonar repositorio
git clone https://github.com/jenovoas/diepo-parra.git
cd diepo-parra

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local

# Configurar base de datos
npx prisma migrate dev

# Iniciar servidor de desarrollo
npm run dev
```

Accede a http://localhost:3000

---

## 📋 Variables de Entorno

Crear archivo `.env.local`:

```env
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/diepo_parra"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
JWT_SECRET="tu-secreto-seguro-aqui"
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15** - Framework React con server components
- **TypeScript** - Tipado estático para mayor seguridad
- **React 18** - Librería UI con hooks y suspense
- **Tailwind CSS** - Utilidades de estilo
- **React Hook Form** - Gestión de formularios eficiente

### Backend
- **Next.js API Routes** - APIs serverless
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Base de datos relacional
- **JWT Authentication** - Autenticación segura

### Herramientas
- **Jest** - Testing framework
- **ESLint** - Análisis de código
- **Prettier** - Formateador de código

---

## 📁 Estructura del Proyecto

```
diepo-parra/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Panel principal
│   └── layout.tsx         # Layout raíz
├── components/            # Componentes React reutilizables
├── lib/                   # Utilidades y funciones
├── prisma/                # Esquema y migraciones
├── __tests__/             # Tests automatizados
├── public/                # Archivos estáticos
├── package.json
├── tsconfig.json
└── next.config.ts
```

---

## 🏃 Comandos Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo
npm run build            # Build para producción
npm start                # Inicia servidor en producción

# Testing
npm test                 # Ejecuta tests con Jest
npm run test:watch      # Modo watch para tests

# Base de datos
npx prisma migrate dev  # Ejecuta migraciones
npx prisma studio      # Abre Prisma Studio (UI)
npx prisma generate    # Genera cliente Prisma

# Linting
npm run lint            # Ejecuta ESLint
npm run lint:fix        # Corrige errores de linting
```

---

## 📚 Documentación Adicional

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

---

## 🔐 Autenticación

El proyecto incluye un sistema de autenticación completo:

- Registro de usuarios
- Login/Logout
- JWT tokens
- Rutas protegidas
- Refresh tokens

Consulta `PROPUESTA_CLIENTE.md` para más detalles de negocio.

---

## 🧪 Testing

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests en modo watch
npm run test:watch

# Obtener cobertura
npm run test:coverage
```

---

## 📸 Capturas de Pantalla

Ver carpeta de capturas en el repositorio para ver la UI en acción.

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para detalles.

---

## 👨‍💻 Autor

**Juan Novoa** - [@jenovoas](https://github.com/jenovoas)

---

## 🎉 Agradecimientos

Gracias a la comunidad de Next.js y TypeScript por las excelentes herramientas y documentación.

<div align="center">

⭐ Si te gusta este proyecto, dame una estrella en GitHub ⭐

</div>
