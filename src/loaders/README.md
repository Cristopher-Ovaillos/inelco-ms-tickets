# loaders

en vez de cargar los app.use() directamente en el archivo app.ts, se pueden crear loaderes que se encargan de cargar las rutas y middlewares.

Tenemos como ventaja el desacoplaimetno porque cada servicio se configura de forma aislada. Ademas, facilidad para pruebas por ejemplo para inicializar solo lo que se necesita durante los test de integracion y por ultimo  para cambiar la bd...con esto solo modificamos el loader especifico y no tenemos que modificar el app.ts