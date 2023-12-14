import { Section } from "../types/section.type";

export type StoreResponseDto =  {
    id: string;
    name: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    sections: Section[];
    createdAt: Date;
}

export type StoreRequestDto = {
    name: string;
    street: string;
    city: string;
    country: string;
    zipCode: string;
    sections: Section[];
}