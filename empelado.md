### Tabla `empleados`

| Columna | Tipo de Dato | Descripción |
|---|---|---|
| `id` | `uuid` | Identificador único del empleado (llave primaria) |
| `nombre` | `text` | Nombre del empleado |
| `apellido` | `text` | Apellido del empleado |
| `email` | `text` | Correo electrónico del empleado (debe ser único) |
| `puesto` | `text` | Cargo o puesto del empleado |
| `departamento_id` | `uuid` | Llave foránea que referencia a la tabla `departamentos` |
| `created_at` | `timestamp` | Fecha y hora de creación del registro |
Error: Could not find a relationship between 'empleados' and 'departamento_id' in the schema cache


-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
index-BolV65SI.js:82  GET https://mppxcbzealcbwmmsvmsn.supabase.co/rest/v1/empleados?select=*%2Cdepartamento_id%28*%29 400 (Bad Request)



CREATE TABLE public.catalogo_tareas (
catalogoid integer GENERATED ALWAYS AS IDENTITY NOT NULL,
tipotrabajoid integer NOT NULL,
codigo_tarea character varying,
descripcion_tarea text NOT NULL,
escargable boolean NOT NULL DEFAULT true,
CONSTRAINT catalogo_tareas_pkey PRIMARY KEY (catalogoid),
CONSTRAINT fk_catalogo_tipo_trabajo FOREIGN KEY (tipotrabajoid) REFERENCES public.tipo_de_trabajo(tipotrabajoid)
);
CREATE TABLE public.clientes (
clienteid integer GENERATED ALWAYS AS IDENTITY NOT NULL,
nombrecliente character varying NOT NULL UNIQUE,
parentclienteid integer,
activo boolean DEFAULT true,
CONSTRAINT clientes_pkey PRIMARY KEY (clienteid),
CONSTRAINT fk_cliente_parent FOREIGN KEY (parentclienteid) REFERENCES public.clientes(clienteid)
);
CREATE TABLE public.departamentos (
departamentoid integer GENERATED ALWAYS AS IDENTITY NOT NULL,
nombredepto character varying NOT NULL UNIQUE,
CONSTRAINT departamentos_pkey PRIMARY KEY (departamentoid)
);
CREATE TABLE public.empleados (
empleadoid integer GENERATED ALWAYS AS IDENTITY NOT NULL,
nombrecompleto character varying NOT NULL,
puestoid integer NOT NULL,
departamentoid integer NOT NULL,
activo boolean DEFAULT true,
usuario_id uuid,
role text DEFAULT 'usuario'::text,
CONSTRAINT empleados_pkey PRIMARY KEY (empleadoid),
CONSTRAINT fk_empleado_puesto FOREIGN KEY (puestoid) REFERENCES public.puestos(puestoid),
CONSTRAINT fk_empleado_depto FOREIGN KEY (departamentoid) REFERENCES public.departamentos(departamentoid),
CONSTRAINT fk_empleado_auth_user FOREIGN KEY (usuario_id) REFERENCES auth.users(id)
);
CREATE TABLE public.proyectos (
proyectoid integer GENERATED ALWAYS AS IDENTITY NOT NULL,
clienteid integer NOT NULL,
nombreproyecto character varying NOT NULL,
periodorevision character varying,
referenciacaseware character varying UNIQUE,
tipotrabajoid integer,
activo boolean DEFAULT true,
CONSTRAINT proyectos_pkey PRIMARY KEY (proyectoid),
CONSTRAINT fk_proyecto_cliente FOREIGN KEY (clienteid) REFERENCES public.clientes(clienteid),
CONSTRAINT fk_proyecto_tipotrabajo FOREIGN KEY (tipotrabajoid) REFERENCES public.tipo_de_trabajo(tipotrabajoid)
);
CREATE TABLE public.puestos (
puestoid integer GENERATED ALWAYS AS IDENTITY NOT NULL,
nombrepuesto character varying NOT NULL UNIQUE,
CONSTRAINT puestos_pkey PRIMARY KEY (puestoid)
);
CREATE TABLE public.registrosdetiempo (
registroid bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
empleadoid integer NOT NULL,
tareaid integer NOT NULL,
fecha date NOT NULL,
horas numeric NOT NULL CHECK (horas > 0::numeric),
notasadicionales text,
clienteid integer,
proyectoid integer,
referenciacaseware character varying,
CONSTRAINT registrosdetiempo_pkey PRIMARY KEY (registroid),
CONSTRAINT fk_registro_empleado FOREIGN KEY (empleadoid) REFERENCES public.empleados(empleadoid),
CONSTRAINT fk_registro_tarea FOREIGN KEY (tareaid) REFERENCES public.tareas(tareaid),
CONSTRAINT fk_registro_cliente FOREIGN KEY (clienteid) REFERENCES public.clientes(clienteid),
CONSTRAINT fk_registro_proyecto FOREIGN KEY (proyectoid) REFERENCES public.proyectos(proyectoid)
);
CREATE TABLE public.tareas (
tareaid integer GENERATED ALWAYS AS IDENTITY NOT NULL,
proyectoid integer NOT NULL,
descripciontarea text NOT NULL,
escargable boolean NOT NULL DEFAULT true,
categoria_trabajo character varying,
codigo_tarea character varying,
CONSTRAINT tareas_pkey PRIMARY KEY (tareaid),
CONSTRAINT fk_tarea_proyecto FOREIGN KEY (proyectoid) REFERENCES public.proyectos(proyectoid)
);
CREATE TABLE public.tipo_de_trabajo (
tipotrabajoid integer GENERATED ALWAYS AS IDENTITY NOT NULL,
departamento character varying NOT NULL,
nombre_trabajo character varying NOT NULL UNIQUE,
CONSTRAINT tipo_de_trabajo_pkey PRIMARY KEY (tipotrabajoid)
);