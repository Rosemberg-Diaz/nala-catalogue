# nala catalogue

Sitio principal publicado en Firebase Hosting Spark: **https://nala-catalogue.web.app/**. El panel está en **https://nala-catalogue.web.app/admin** y se abre también desde el enlace **Administración** del pie de página. Requiere una cuenta de Firebase Authentication con el claim `admin: true`. GitHub Pages continúa disponible y utiliza el mismo catálogo de Firestore.

Tienda web mobile first para un emprendimiento de accesorios al por mayor. La experiencia pública completa —inicio, categorías, búsqueda, producto, variantes, bolsa, checkout, revisión y WhatsApp— funciona sin Firebase usando un repositorio mock. La interfaz y la lógica de negocio consumen `CatalogRepository`, por lo que Firebase se activa sin reescribir las pantallas.

## Versión estática para compartir por GitHub Pages

La carpeta `docs/` contiene la aplicación **ya compilada**, incluidas sus fotografías. Está lista para guardarse en Git junto al código. La compilación conectada usa Firebase para el catálogo y la autenticación; no necesita un servidor propio. El WhatsApp configurado es **+57 315 002 6236**.

Después de subir los archivos a la rama `main`, abre **Settings → Pages → Build and deployment → Deploy from a branch**, selecciona **main** y **/docs** y guarda. Es el método de [publicación desde una carpeta de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

La URL esperada al activar Pages es **https://rosemberg-diaz.github.io/nala-catalogue/**. Dejar los archivos en el repositorio local no activa ni publica Pages por sí solo.

Esta versión conserva el catálogo, variantes, bolsa, checkout, revisión, WhatsApp y administración. Los enlaces usan `#/catalogo` y `#/producto/...` para poder compartirlos y recargarlos sin errores 404. Con Firebase los cambios del administrador son compartidos. Solo en modo mock cada navegador conserva su propia muestra local.

Para actualizar lo que ve el cliente, modifica el código o los datos de `src/data/seed.ts`, ejecuta `pnpm build:pages` y sube también los cambios de `docs/`. No edites manualmente los archivos compilados. El build de Pages usa datos mock por defecto; con `VITE_PAGES_DATA_SOURCE=firebase` se conecta a Firestore y al proveedor de imágenes configurado. `node scripts/build-pages.mjs --demo` genera explícitamente la muestra local. El build normal `pnpm build` sigue generando `dist/` para Firebase Hosting.

Para probar la versión compilada bajo una subcarpeta como Pages: `node scripts/serve-pages.mjs`, y abre `http://127.0.0.1:4175/nala-catalogue/`. También puedes ejecutar `pnpm test:pages` para validar recargas, imágenes, checkout, administración y el enlace de WhatsApp en escritorio y móvil.

## Desarrollo local

Requiere Node 22.13+ (el runtime incluido en Codex funciona) y pnpm 11.19+.

```bash
pnpm install
pnpm dev
```

Abre `http://localhost:5173`. La app arranca con `VITE_DATA_SOURCE=mock` implícito, datos ficticios y fotografías demo de Unsplash guardadas en `public/images`. Los valores de negocio provisionales están en [`src/config.ts`](src/config.ts). El administrador local está en `/admin`; sus cambios se conservan solo en ese navegador.

## Qué está implementado

- Catálogo de productos activos, categorías, búsqueda normalizada, filtros y ordenamiento.
- Productos con fotografías, una o varias opciones obligatorias u opcionales, galería y fallback de imagen.
- Bolsa persistente con variantes, cantidades, subtotales, total y validación contra el catálogo actual.
- Checkout con domicilio (nombre, ciudad, departamento, barrio, dirección, complemento e indicaciones) o recogida en local. Los datos personales viven únicamente en memoria y se borran al recargar.
- Revisión final y mensaje legible prellenado para `https://wa.me/…`. Si aún no hay número configurado, el pedido se puede copiar para pruebas.
- Aviso informativo de compras al por mayor desde $50.000, sin bloquear pedidos inferiores ni aplicar cambios de precio.
- Administración de productos, categorías, fotografías, opciones, destacado y activo/inactivo. Precio normal y mayorista por separado, y eliminación definitiva con confirmación. No hay inventario, clientes, pedidos ni pagos.
- Firebase opcional: Firestore, Authentication con custom claim `admin`, reglas de seguridad, Hosting y almacenamiento de imágenes.

## Configuración de negocio

1. Copia `.env.example` a `.env.local`.
2. Para pruebas conserva `VITE_DATA_SOURCE=mock`. `VITE_WHATSAPP_NUMBER=573150026236` corresponde al número confirmado del negocio; cámbialo solo si cambia ese contacto.
3. Cambia los valores de marca, redes, ciudad y punto de recogida en `src/config.ts`. La dirección incluida por defecto está marcada como pendiente y no es una dirección real.
4. Sustituye fotografías y textos de muestra antes de publicar.

## Firebase

Completa en `.env.local`:

```dotenv
VITE_DATA_SOURCE=firebase
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_IMAGE_PROVIDER=static
VITE_WHATSAPP_NUMBER=573150026236
VITE_PICKUP_ADDRESS=Dirección confirmada del local
VITE_SITE_URL=https://tu-dominio.web.app
VITE_FIREBASE_EMULATORS=false
```

Configura Firestore y despliega las reglas desde `firebase.json`. Carga documentos en `categories/{id}` y `products/{id}` con el esquema de [`src/domain/models.ts`](src/domain/models.ts). El panel permite desactivar y reactivar productos, o eliminarlos definitivamente después de confirmar. La bolsa detecta los productos eliminados y bloquea su compra.

El panel usa Email/Password de Firebase Authentication. No existe registro público. Crea el usuario desde Firebase Console y asígnale el custom claim `admin` desde un entorno confiable:

```bash
pnpm exec firebase login
# PowerShell: reutiliza la sesión local autorizada, sin copiar claves privadas.
$env:NALA_USE_FIREBASE_CLI='true'
pnpm admin:grant CORREO_O_UID PROJECT_ID
```

Después cierra e inicia sesión para renovar el token. `firestore.rules` restringe las escrituras a `request.auth.token.admin == true`, valida los campos y permite lectura pública únicamente de productos activos. `storage.rules` deja leer las imágenes del catálogo y solo permite crear WebP de hasta 2 MB a un administrador.

### Imágenes y costos

El modo `static` es la opción recomendada para un catálogo pequeño y mantiene las imágenes en Hosting. Desde el administrador se pueden seleccionar fotos, optimizarlas a WebP de máximo 1600 px y descargarlas para agregarlas a `public/images`. Para URL externas se aceptan únicamente HTTPS o rutas `/images/...`.

Nala mantiene Firebase Spark sin facturación. El proveedor `cloudinary` permite subir fotografías desde el panel a una cuenta Free externa; Firestore guarda solo sus URL y metadatos. El proveedor opcional `firebase-storage` requiere Blaze y no se utiliza para esta instalación. La aplicación nunca guarda Base64 en Firestore.

## Validación y deployment

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

`tests/unit/order.test.ts` cubre variantes, precios, privacidad, modalidades, mensaje y datos corruptos. `tests/e2e/shop.spec.ts` cubre el flujo completo en escritorio y móvil, persistencia, cambio de catálogo, administración, fallback de imágenes y anchos 360/390/412/1280 px. En entornos restringidos Chromium puede devolver `spawn EPERM`; ejecútalo con permisos de navegador del entorno.

El script de publicación bloquea despliegues comerciales si faltan credenciales, número, dirección o URL:

```bash
pnpm deploy
```

El workflow [`/.github/workflows/ci.yml`](.github/workflows/ci.yml) ejecuta typecheck, lint, tests, build, Playwright y reglas de Firebase en cada push/PR.

## Checklist antes de publicar

Confirma materiales y medidas, precios, fotografías con licencia, dirección del local, costos y cobertura de envío. Completa `.env.local`, revisa el texto de privacidad y ejecuta todas las comprobaciones. Los productos y sus fotografías son de muestra y están identificados como tales en el sitio.

## Identidad Nala y venta al por mayor

El logotipo y el corazón en `public/images/nala-logo.jpg` y `public/images/nala-heart.jpg` son los originales suministrados por el negocio. La interfaz usa su paleta rosa. Los mensajes de venta al por mayor se configuran en `src/config.ts` y enlazan a WhatsApp para consultar condiciones. El campo `price` guarda el precio al detal; `wholesalePrice` es el precio predeterminado del catálogo, ordenamiento, bolsa y WhatsApp. El detalle muestra ambos precios. El aviso de $50.000 es informativo: incluso por debajo de ese total se usa el mayorista y Nala decide las condiciones por WhatsApp. El panel exige el precio mayorista al guardar; productos antiguos sin ese dato mantienen el precio disponible como compatibilidad, sin inventar descuentos. No se muestran condiciones internas de preparación.

## Conexión Firebase Spark y Cloudinary Free

Proyecto de Nala: `nala-catalogue`. Base predeterminada Firestore Standard en `us-east1`. La configuración local se guarda en `.env.local`, excluido de Git. Para una nueva instalación configura:

```dotenv
VITE_DATA_SOURCE=firebase
VITE_PAGES_DATA_SOURCE=firebase
VITE_IMAGE_PROVIDER=cloudinary
VITE_CLOUDINARY_CLOUD_NAME=tu-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=nala_productos
```

Completa también los valores `VITE_FIREBASE_*` de la app web. No agregues secretos de Cloudinary ni claves de servicio a variables `VITE_*`: esas variables son públicas en el navegador. El build comprueba los datos requeridos antes de generar la aplicación.

En Cloudinary Free crea un preset Unsigned limitado a WebP, máximo 2 MB, con `disallow_public_id` activo y carpeta dedicada. La app optimiza las fotos antes de subirlas. El preset unsigned es público: el login del panel protege los cambios del catálogo, pero no impide que alguien que conozca el preset intente consumir la cuota de subidas externamente. Mantén las restricciones del preset y revisa su uso. Si se necesita autorización estricta también en el servicio de imágenes, hará falta un endpoint que firme las cargas y verifique el token de Firebase; no se incluye un secreto en el frontend para simular esa protección.

Eliminar un producto o quitar una foto retira su referencia del catálogo. El archivo de Cloudinary permanece en la biblioteca, donde se pueden limpiar imágenes sin uso; no se elimina automáticamente porque puede estar compartido. Todas las referencias de fotografías del catálogo de Firestore se migraron a Cloudinary, incluidas las de productos inactivos. Las nuevas fotos se cargan a Cloudinary desde Nala. Los archivos locales se conservan para la muestra offline y las imágenes editoriales; el catálogo conectado no los usa.

Los planes gratuitos tienen cuotas; no son ilimitados. Esta instalación no activa Blaze, facturación, Cloud Functions ni Firebase Storage. Consulta las [cuotas de Firestore](https://firebase.google.com/docs/firestore/quotas) y el [plan Free de Cloudinary](https://cloudinary.com/documentation/billing_and_plans).

### Cargar datos iniciales sin sobrescribir

```powershell
pnpm exec firebase login
$env:NALA_USE_FIREBASE_CLI='true'
pnpm firebase:seed nala-catalogue
pnpm firebase:seed nala-catalogue --write
```

El primer comando de carga muestra los documentos pendientes. El segundo crea únicamente los que no existen, con una precondición atómica para no sobrescribir cambios concurrentes. Los precios mayoristas de la muestra son ficticios. La carga inicial no se ejecuta al abrir la web: en modo Firebase el catálogo viene exclusivamente de Firestore, incluso si está vacío o falla la conexión.

`scripts/setup-firebase.mjs` permite comprobar que la facturación esté desactivada, habilitar las API de Firestore/Authentication y configurar el acceso por correo. La inicialización de Authentication en Spark se hace desde la consola con «Comenzar»; el script no activa Identity Platform.

`node scripts/setup-admin.mjs PROJECT_ID CORREO` crea o encuentra la cuenta, conserva sus claims y agrega `admin: true`. Genera un enlace privado para que la persona elija su contraseña en `.tools/admin-access.md`, excluido de Git. No envía correos ni guarda contraseñas. Si el enlace caduca puede generarse otro. La autorización de la CLI se almacena fuera del código; en esta sesión se usa el directorio ignorado `.firebase-cli-config` mediante `XDG_CONFIG_HOME`.

### Pruebas con Firebase

`pnpm test:firebase` inicia los emuladores y verifica autenticación, catálogo compartido entre navegadores, ambos precios, carga de fotos (respuesta de Cloudinary simulada), desactivación y eliminación. Solo usa el proyecto `demo-nala`. `pnpm test:rules` verifica que visitantes y usuarios sin el claim no puedan escribir ni eliminar. El entorno `.env.test` mantiene las pruebas de muestra separadas de la conexión real.

`node scripts/migrate-catalog-images.mjs` audita las referencias de Firestore. Con `--write` optimiza y sube las imágenes locales pendientes, reutiliza cada imagen compartida y actualiza solo el campo de fotos de cada producto con una precondición contra cambios concurrentes. Requiere el servidor de desarrollo en 127.0.0.1:5173 y una sesión Firebase autorizada. El registro ignorado `.tools/image-migration-PROJECT_ID.json` permite reanudar sin duplicar cargas completadas.
