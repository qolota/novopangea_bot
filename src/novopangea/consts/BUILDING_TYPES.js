const BUILDING_TYPES = {
    WORKERS_JOB_BUILDINGS: [
        'energy',
        'materials',
        'food',
    ],
    WORKERS_REST_BUILDINGS: [
        'rest',
    ],
    CREATURES_REST_BUILDINGS: [
        'creature',
    ],
    RESOURCE_TYPE_TO_BUILDING_TYPE: {
        creature: 'rest',
        rest: 'rest',
        energy: 'job',
        materials: 'job',
        food: 'job',
    },
    RESOURCE_TYPE_TO_ALLOCATION_TYPE: {
        creature: 'creatures',
        rest: 'workers',
        energy: 'workers',
        materials: 'workers',
        food: 'workers',
    },
};

export default BUILDING_TYPES;