// estructura para respuestas 

export interface ApiSuccessResponse<T>{
    success: true;
    message?: string;
    data?: T;
    pagination?:{
        page:number;
        limit:number;
        total:number;
        totalPages:number;
    }
}

export interface ApiErrorResponse{
    success: false;
    statusCode: number;
    message: string;
    errors?: Record<string, string[]>;
    stack?: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;