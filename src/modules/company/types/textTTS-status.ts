export type EnableType = 'enable';
export const STATUS_ENABLE: EnableType = 'enable';

export type DisableType = 'disable';
export const STATUS_DISABLE: DisableType = 'disable';


export type textStatus =
EnableType |
DisableType ;

export const TextStatusArr: textStatus[] = [
    STATUS_ENABLE,
  STATUS_DISABLE
];
