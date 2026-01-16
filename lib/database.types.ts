export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            perfiles: {
                Row: {
                    id: string
                    nombre: string
                    telefono: string | null
                    rol: 'cliente' | 'barbero' | 'admin'
                    email: string | null
                }
                Insert: {
                    id: string
                    nombre: string
                    telefono?: string | null
                    rol?: 'cliente' | 'barbero' | 'admin'
                    email?: string | null
                }
                Update: {
                    id?: string
                    nombre?: string
                    telefono?: string | null
                    rol?: 'cliente' | 'barbero' | 'admin'
                    email?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "perfiles_id_fkey"
                        columns: ["id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            servicios: {
                Row: {
                    id: string
                    nombre: string
                    duracion_minutos: number
                    precio: number
                    activo: boolean
                    descripcion: string | null
                    imagen_url: string | null
                }
                Insert: {
                    id?: string
                    nombre: string
                    duracion_minutos: number
                    precio: number
                    activo?: boolean
                    descripcion?: string | null
                    imagen_url?: string | null
                }
                Update: {
                    id?: string
                    nombre?: string
                    duracion_minutos?: number
                    precio?: number
                    activo?: boolean
                    descripcion?: string | null
                    imagen_url?: string | null
                }
                Relationships: []
            }
            citas: {
                Row: {
                    id: string
                    created_at: string
                    fecha_hora: string
                    estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'
                    cliente_id: string | null
                    barbero_id: string
                    servicio_id: string
                    cliente_nombre: string | null
                    cliente_telefono: string | null
                    cliente_email: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    fecha_hora: string
                    estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'
                    cliente_id?: string | null
                    barbero_id: string
                    servicio_id: string
                    cliente_nombre?: string | null
                    cliente_telefono?: string | null
                    cliente_email?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    fecha_hora?: string
                    estado?: 'pendiente' | 'confirmada' | 'cancelada' | 'completada'
                    cliente_id?: string | null
                    barbero_id?: string
                    servicio_id?: string
                    cliente_nombre?: string | null
                    cliente_telefono?: string | null
                    cliente_email?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "citas_barbero_id_fkey"
                        columns: ["barbero_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "citas_cliente_id_fkey"
                        columns: ["cliente_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "citas_servicio_id_fkey"
                        columns: ["servicio_id"]
                        referencedRelation: "servicios"
                        referencedColumns: ["id"]
                    }
                ]
            }
            horarios_disponibilidad: {
                Row: {
                    id: string
                    barbero_id: string
                    dia_semana: number
                    hora_inicio: string
                    hora_fin: string
                    activo: boolean
                }
                Insert: {
                    id?: string
                    barbero_id: string
                    dia_semana: number
                    hora_inicio: string
                    hora_fin: string
                    activo?: boolean
                }
                Update: {
                    id?: string
                    barbero_id?: string
                    dia_semana?: number
                    hora_inicio?: string
                    hora_fin?: string
                    activo?: boolean
                }
                Relationships: [
                    {
                        foreignKeyName: "horarios_disponibilidad_barbero_id_fkey"
                        columns: ["barbero_id"]
                        referencedRelation: "perfiles"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
