import { Section } from "../types/section.type";
import { Store } from "../types/store.type";

export class GetStores {
    static readonly type = '[Store] Get';
}

export class DeleteStore {
    static readonly type = '[Store] Delete';

    constructor(public id: string) {
    }
}

export class SetSelectedStore {
    static readonly type = '[Store] Set';

    constructor(public payload: Store | null) {
    }
}

export class AddStore {
    static readonly type = '[Store] Add';

    constructor(public payload: Store) {
    }
}

export class GetSelectedStore {
    static readonly type = '[Store] Get Selected';

    constructor(public id: string) {
    }
}

export class UpdateStore {
    static readonly type = '[Store] Update';

    constructor(public payload: Store, public id: string) {
    }
}

export class DropSection {
    static readonly type = '[Store] Drop Section';

    constructor(public prevIndex: number, public currentIndex: number) {
    }
}

export class SaveSections {
    static readonly type = '[Store] Save Sections';
}

export class DeleteSection {
    static readonly type = '[Store] Delete Section';

    constructor(public id: string) {
    }
}

export class AddSection {
    static readonly type = '[Store] Add Section';

    constructor(public payload: Section) {
    }
}