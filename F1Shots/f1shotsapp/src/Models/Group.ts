export interface Group {
    id: string;
    name: string;
    adminUserIds: string[];
    playersIds: string[];
    playersUserNames: string[];
    years: number[];
    motorsport: Motorsport;
    public: boolean;
    open: boolean;
}

export enum Motorsport
{
    F1 = 0,
    F2 = 1,
    F3 = 2,
    WEC = 3,
    MotoGp = 4
}