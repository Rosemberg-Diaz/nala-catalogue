# nala catalogue

Tienda web mobile first para un emprendimiento de accesorios bajo pedido. La experiencia pública completa —inicio, categorías, búsqueda, producto, variantes, bolsa, checkout, revisión y WhatsApp— funciona sin Firebase usando un repositorio mock. La interfaz y la lógica de negocio consumen `CatalogRepository`, por lo que Firebase se activa sin reescribir las pantallas.

## Versión estática para compartir por GitHub Pages

La carpeta `docs/` contiene la aplicación **ya compilada**, incluidas sus fotografías. Está lista para guardarse en Git junto al código. No requiere Firebase ni un servidor de aplicación. El WhatsApp configurado es **+57 317 356 0428**.

Después de subir los archivos a la rama `main`, abre **Settings → Pages → Build and deployment → Deploy from a branch**, selecciona **main** y **/docs** y guarda. Es el método de [publicación desde una carpeta de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site).

La URL esperada al activar Pages es **https://rosemberg-diaz.github.io/nala-catalogue/**. Dejar los archivos en el repositorio local no activa ni publica Pages por sí solo.

Esta versión conserva el catálogo, variantes, bolsa, checkout, revisión, WhatsApp y administración local. Los enlaces usan `#/catalogo` y `#/producto/...` para poder compartirlos y recargarlos sin errores 404. Cada visitante tiene sus propios cambios de muestra en su navegador; no son cambios compartidos de un catálogo real.

Para actualizar lo que ve el cliente, modifica el código o los datos de `src/data/seed.ts`, ejecuta `pnpm build:pages` y sube también los cambios de `docs/`. No edites manualmente los archivos compilados. El build de Pages fuerza datos mock e imágenes estáticas. El build normal `pnpm build` sigue generando `dist/` para Firebase Hosting.

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
- Preparación de hasta 3 días hábiles visible antes de confirmar.
- Administración de productos, categorías, fotografías, opciones, destacado y activo/inactivo. No hay inventario, clientes, pedidos ni pagos.
- Firebase opcional: Firestore, Authentication con custom claim `admin`, reglas de seguridad, Hosting y almacenamiento de imágenes.

## Configuración de negocio

1. Copia `.env.example` a `.env.local`.
2. Para pruebas conserva `VITE_DATA_SOURCE=mock`. `VITE_WHATSAPP_NUMBER=573173560428` corresponde al número confirmado del negocio; cámbialo solo si cambia ese contacto.
3. Cambia los valores de marca, redes, ciudad, plazo y punto de recogida en `src/config.ts`. La dirección incluida por defecto está marcada como pendiente y no es una dirección real.
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
VITE_WHATSAPP_NUMBER=573173560428
VITE_PICKUP_ADDRESS=Dirección confirmada del local
VITE_SITE_URL=https://tu-dominio.web.app
VITE_FIREBASE_EMULATORS=false
```

Configura Firestore y despliega las reglas desde `firebase.json`. Carga documentos en `categories/{id}` y `products/{id}` con el esquema de [`src/domain/models.ts`](src/domain/models.ts). No uses eliminación física en el panel: desactiva el producto para conservarlo.

El panel usa Email/Password de Firebase Authentication. No existe registro público. Crea el usuario desde Firebase Console y asígnale el custom claim `admin` desde un entorno confiable:

```bash
gcloud auth application-default login
pnpm admin:grant -- UID PROJECT_ID
```

Después cierra e inicia sesión para renovar el token. `firestore.rules` restringe las escrituras a `request.auth.token.admin == true`, valida los campos y permite lectura pública únicamente de productos activos. `storage.rules` deja leer las imágenes del catálogo y solo permite crear WebP de hasta 2 MB a un administrador.

### Imágenes y costos

El modo `static` es la opción recomendada para un catálogo pequeño y mantiene las imágenes en Hosting. Desde el administrador se pueden seleccionar fotos, optimizarlas a WebP de máximo 1600 px y descargarlas para agregarlas a `public/images`. Para URL externas se aceptan únicamente HTTPS o rutas `/images/...`.

`firebase-storage` está preparado en `src/data/images.ts`, pero Cloud Storage for Firebase requiere el plan Blaze; aunque conserva cuotas sin costo, exige una cuenta de facturación. Revisa el uso y crea alertas de presupuesto antes de activarlo. Hosting y Firestore pueden comenzar con sus cuotas sin costo. La aplicación nunca guarda Base64 en Firestore.

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

Confirma identidad de marca, materiales y medidas, precios, fotografías con licencia, número de WhatsApp, dirección del local, costos y cobertura de envío. Completa `.env.local`, revisa el texto de privacidad y ejecuta todas las comprobaciones. La marca y los productos incluidos en esta entrega son provisionales y están identificados como tales en el sitio.
