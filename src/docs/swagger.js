
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.3",

        info: {
            title: "Room Booking API",
            version: "1.0.0",
            description:
                "REST API do zarządzania budynkami, salami i rezerwacjami."
        },

        servers: [
            {
                url: "/",
                description: "Aktualny serwer"
            }
        ],

        tags: [
            {
                name: "Auth",
                description: "Rejestracja, logowanie i konto użytkownika"
            },
            {
                name: "Buildings",
                description: "Zarządzanie budynkami"
            },
            {
                name: "Rooms",
                description: "Zarządzanie salami"
            },
            {
                name: "Reservations",
                description: "Zarządzanie rezerwacjami"
            }
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: "Wklej token JWT uzyskany podczas logowania."
                }
            },

            schemas: {
                // Wspólny format błędów API
                ErrorResponse: {
                    type: "object",
                    required: ["error"],
                    properties: {
                        error: {
                            type: "object",
                            required: ["code", "message", "requestId"],
                            properties: {
                                code: {
                                    type: "string",
                                    example: "VALIDATION_ERROR"
                                },
                                message: {
                                    type: "string",
                                    example: "Validation failed"
                                },
                                details: {
                                    nullable: true,
                                    description: "Dodatkowe informacje o błędzie.",
                                    oneOf: [
                                        {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                additionalProperties: true
                                            }
                                        },
                                        {
                                            type: "object",
                                            additionalProperties: true
                                        }
                                    ]
                                },
                                requestId: {
                                    type: "string",
                                    example: "7c66f1e4-6f25-4f5e-9e75-54a9acac11c1"
                                }
                            }
                        }
                    }
                },

                // AUTH
                RegisterRequest: {
                    type: "object",
                    required: ["email", "password"],
                    additionalProperties: false,
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                            example: "user@example.com"
                        },
                        password: {
                            type: "string",
                            minLength: 10,
                            maxLength: 72,
                            example: "SecurePassword123"
                        }
                    }
                },

                LoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    additionalProperties: false,
                    properties: {
                        email: {
                            type: "string",
                            format: "email",
                            example: "user@example.com"
                        },
                        password: {
                            type: "string",
                            minLength: 1,
                            example: "SecurePassword123"
                        }
                    }
                },

                TokenResponse: {
                    type: "object",
                    required: ["accessToken", "tokenType", "expiresIn"],
                    properties: {
                        accessToken: {
                            type: "string",
                            description: "Token JWT."
                        },
                        tokenType: {
                            type: "string",
                            example: "Bearer"
                        },
                        expiresIn: {
                            type: "string",
                            example: "15m"
                        }
                    }
                },

                User: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer",
                            example: 1
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "user@example.com"
                        },
                        role: {
                            type: "string",
                            enum: ["USER", "ADMIN"],
                            example: "USER"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time"
                        }
                    }
                },

                // BUILDINGS
                BuildingInput: {
                    type: "object",
                    required: ["name", "address"],
                    additionalProperties: false,
                    properties: {
                        name: {
                            type: "string",
                            minLength: 2,
                            maxLength: 100,
                            example: "Budynek A"
                        },
                        address: {
                            type: "string",
                            minLength: 5,
                            maxLength: 255,
                            example: "ul. Akademicka 1, Kraków"
                        }
                    }
                },

                BuildingPatch: {
                    type: "object",
                    minProperties: 1,
                    additionalProperties: false,
                    properties: {
                        name: {
                            type: "string",
                            minLength: 2,
                            maxLength: 100
                        },
                        address: {
                            type: "string",
                            minLength: 5,
                            maxLength: 255
                        }
                    }
                },

                Building: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer",
                            example: 1
                        },
                        name: {
                            type: "string",
                            example: "Budynek A"
                        },
                        address: {
                            type: "string",
                            example: "ul. Akademicka 1, Kraków"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time"
                        },
                        roomsCount: {
                            type: "integer",
                            description: "Liczba sal w budynku."
                        }
                    }
                },

                // ROOMS
                RoomInput: {
                    type: "object",
                    required: ["buildingId", "name", "capacity"],
                    additionalProperties: false,
                    properties: {
                        buildingId: {
                            type: "integer",
                            minimum: 1,
                            example: 1
                        },
                        name: {
                            type: "string",
                            minLength: 1,
                            maxLength: 100,
                            example: "Sala 101"
                        },
                        capacity: {
                            type: "integer",
                            minimum: 1,
                            example: 30
                        }
                    }
                },

                RoomPatch: {
                    type: "object",
                    minProperties: 1,
                    additionalProperties: false,
                    properties: {
                        buildingId: {
                            type: "integer",
                            minimum: 1
                        },
                        name: {
                            type: "string",
                            minLength: 1,
                            maxLength: 100
                        },
                        capacity: {
                            type: "integer",
                            minimum: 1
                        }
                    }
                },

                Room: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer",
                            example: 1
                        },
                        buildingId: {
                            type: "integer",
                            example: 1
                        },
                        name: {
                            type: "string",
                            example: "Sala 101"
                        },
                        capacity: {
                            type: "integer",
                            example: 30
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time"
                        },
                        building: {
                            nullable: true,
                            type: "object",
                            properties: {
                                id: {
                                    type: "integer"
                                },
                                name: {
                                    type: "string"
                                }
                            }
                        }
                    }
                },

                // RESERVATIONS
                ReservationInput: {
                    type: "object",
                    required: [
                        "roomId",
                        "participants",
                        "startTime",
                        "endTime"
                    ],
                    additionalProperties: false,
                    properties: {
                        roomId: {
                            type: "integer",
                            minimum: 1,
                            example: 1
                        },
                        participants: {
                            type: "integer",
                            minimum: 1,
                            example: 10
                        },
                        startTime: {
                            type: "string",
                            format: "date-time",
                            example: "2026-11-10T10:00:00+01:00"
                        },
                        endTime: {
                            type: "string",
                            format: "date-time",
                            example: "2026-11-10T11:00:00+01:00"
                        }
                    }
                },

                Reservation: {
                    type: "object",
                    properties: {
                        id: {
                            type: "integer"
                        },
                        room: {
                            nullable: true,
                            type: "object",
                            properties: {
                                id: {
                                    type: "integer"
                                },
                                name: {
                                    type: "string"
                                },
                                building: {
                                    nullable: true,
                                    type: "object",
                                    properties: {
                                        id: {
                                            type: "integer"
                                        },
                                        name: {
                                            type: "string"
                                        }
                                    }
                                }
                            }
                        },
                        user: {
                            type: "object",
                            properties: {
                                id: {
                                    type: "integer"
                                },
                                email: {
                                    type: "string",
                                    format: "email"
                                }
                            }
                        },
                        participants: {
                            type: "integer"
                        },
                        startTime: {
                            type: "string",
                            format: "date-time"
                        },
                        endTime: {
                            type: "string",
                            format: "date-time"
                        },
                        status: {
                            type: "string",
                            enum: ["CONFIRMED", "CANCELLED"]
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time"
                        },
                        cancelledAt: {
                            type: "string",
                            format: "date-time",
                            nullable: true
                        }
                    }
                },

                ReservationList: {
                    type: "object",
                    required: ["data", "meta"],
                    properties: {
                        data: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/Reservation"
                            }
                        },
                        meta: {
                            type: "object",
                            properties: {
                                page: {
                                    type: "integer"
                                },
                                limit: {
                                    type: "integer"
                                },
                                total: {
                                    type: "integer"
                                },
                                totalPages: {
                                    type: "integer"
                                }
                            }
                        }
                    }
                },

                DeleteResult: {
                    type: "object",
                    required: ["message"],
                    properties: {
                        message: {
                            type: "string",
                            example: "Resource deleted successfully"
                        }
                    }
                }
            },

            responses: {
                BadRequest: {
                    description: "Nieprawidłowe dane wejściowe.",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },

                Unauthorized: {
                    description: "Brak tokenu lub token jest nieprawidłowy albo wygasł.",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },

                Forbidden: {
                    description: "Użytkownik nie posiada wymaganych uprawnień.",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },

                NotFound: {
                    description: "Nie znaleziono wskazanego zasobu.",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },

                Conflict: {
                    description: "Konflikt danych lub naruszenie reguł biznesowych.",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                },

                InternalServerError: {
                    description: "Wewnętrzny błąd serwera.",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "#/components/schemas/ErrorResponse"
                            }
                        }
                    }
                }
            }
        }
    },

    apis: [
        "./src/modules/**/*.routes.js"
    ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
