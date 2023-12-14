export class Alert {
    type: AlertType;
    message: string;

    constructor(type: AlertType, message: string = '') {
        this.type=type;
        this.message=message;
    }
}

export enum AlertType {
    Success,
    Error,
    Info,
    Warning,
    NoAlert
}