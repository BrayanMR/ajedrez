# Despliegue con Firebase

Para activar las consultas acotadas del historial, publica los índices de
`firestore.indexes.json` con `firebase deploy --only firestore:indexes --project aljedrez-8962d`.
Hasta que los índices estén listos, el historial usa la consulta anterior.

El frontend usa Firebase Authentication y Firestore del proyecto `aljedrez-8962d`.
Los usuarios existentes pueden acceder con sus credenciales de Firebase. La aplicación
conserva los UID y lee las colecciones existentes `usuarios`, `partidas` y `movimientos`.
El ranking se calcula a partir de los perfiles.

1. Confirma que Correo electrónico/contraseña esté habilitado en Authentication.
2. Con una cuenta autorizada, revisa las reglas activas y publica las de este repositorio
   con `firebase deploy --only firestore:rules --project aljedrez-8962d`.
3. Ejecuta `npm run build` y publica `dist/aljedrez/browser` en el hosting del frontend.
4. Verifica con dos cuentas el acceso, la creación de partida, la sincronización de
   movimientos y el resultado antes de retirar el servicio de Render.

Las reglas verifican la identidad, los turnos y la actualización atómica del ranking.
La validación de las jugadas y el cálculo del resultado siguen ejecutándose en el
cliente. Los perfiles se pueden leer con una sesión iniciada para el ranking y la
pantalla de usuarios.
