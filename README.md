# ACTVIDAD-5-PARQUE-JURÁSICO  

**Desata la aventura, enciende la imaginación, construye el futuro**

---

## 🛠 Construido con las siguientes tecnologías:

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=000)
![Pip](https://img.shields.io/badge/PIP-3775A9?style=for-the-badge&logo=python&logoColor=white)
![NPM](https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=000)
![API Modular](https://img.shields.io/badge/API%20Modular-4CAF50?style=for-the-badge&logo=api&logoColor=white)


---

## 📚 Tabla de Contenidos
- [Descripción General](#descripción-general)  
- [Primeros Pasos](#primeros-pasos)  
- [Requisitos Previos](#requisitos-previos)  
- [Instalación](#instalación)  
- [Uso](#uso)  
- [Pruebas](#pruebas)  

---

## 🦖 Descripción General
**Actividad-5-Parque-Jurásico** es un conjunto de herramientas full-stack diseñado para facilitar la creación de aplicaciones inmersivas y escalables con temática de **Parque Jurásico**.  
Combina despliegue con contenedores, arquitectura API modular y componentes frontend avanzados para optimizar el desarrollo y asegurar la mantenibilidad.

### ⭐ ¿Por qué Actividad-5-Parque-Jurásico?

Este proyecto busca simplificar la creación de sistemas complejos de gestión de parques con enfoque en **seguridad**, **escalabilidad** y **engagement del usuario**.

Características principales:

- 🐳 **Contenerización:**  
  Uso de Docker y docker-compose para entornos consistentes y aislados tanto en desarrollo como en producción.

- 🔐 **Seguridad y Auditoría:**  
  Autenticación robusta, gestión de roles y registro detallado de actividades.

- 🎨 **Gestión Dinámica de Recursos:**  
  Permite personalizar activos visuales y contenido, facilitando temas y actualizaciones dinámicas.

- 🚀 **API Modular:**  
  Endpoints organizados para activos, datos del parque y controles administrativos, ideal para un backend escalable.

- 🖥️ **Frontend Rico en Componentes:**  
  Mapas interactivos, animaciones y una interfaz intuitiva construida con React.

- ⚙️ **Pruebas y Monitoreo:**  
  Configuraciones de testing y métricas de rendimiento para garantizar aplicaciones de alta calidad.

---

## 🚀 Primeros Pasos

### ✅ Requisitos Previos
Antes de ejecutar el proyecto, asegúrate de contar con:

- Lenguaje de programación: **JavaScript**  
- Gestores de paquetes: **Pip**, **Npm**  
- Contenedores: **Docker**

---

## 🔧 Instalación

Construye **Actividad-5-Parque-Jurásico** desde el código fuente e instala las dependencias:

### 1. Clonar el repositorio:
```bash
   git clone https://github.com/YoelUb/Actividad-5-Parque-Jurasico
```

### 2. Entrar en el directorio del proyecto:
```bash
  cd Actividad-5-Parque-Jurasico
```

### 3. Configuración de entorno:

- Crea un archivo **".env"** en la raíz basado en **"env.example"**.

## ▶️ Uso

La forma más sencilla de ejecutar la aplicación completa es utilizando Docker Compose.

### Levantar la aplicación

```bash
   docker-compose up --build
```

Esto iniciará:

- El backend (FastAPI) en http://localhost:8000


- El frontend (React) en http://localhost:3000


- La base de datos (PostgreSQL, si está configurada en el docker-compose)

### Acceder a la aplicación:

Abre tu navegador y navega a http://localhost:3000.


# 🧪 Pruebas

## Backend (Python)

Para ejecutar los tests del backend:

**Asegúrate de tener el entorno virtual activado e instalar las dependencias de requirements.txt.**

- Ejecuta pytest:

```bash
   pytest
```

Nota: Si usas **Docker**, puedes ejecutar docker-compose exec app pytest.


```bash
   docker-compose exec app pytest
```

---

**¡Disfruta construyendo tu propio Parque Jurásico! 🦕**

---

## Contacto

Escribir ante cualquier duda --> yoelurquijo13@gmail.com

---



