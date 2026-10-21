//clase nativa de error de javascript
//lanzar errores controlados indicando el codigo http

export class AppError extends Error{
    public readonly statusCode:number;
    public readonly isOperational:boolean;
    public readonly errors?: Record<string, string[]>;

    constructor(message:string, statusCode=500, isOperational:boolean, errors?: Record<string, string[]>){
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errors = errors;
        //stacktrace limpio
        Error.captureStackTrace(this, this.constructor); // este metodo lo que hace es crear un stack trace limpio, sin incluir el constructor de la clase AppError en el stack trace. Esto es útil para depuración, ya que nos permite ver dónde se originó realmente el error en lugar de ver la pila completa que incluye la creación del error.
    }

}