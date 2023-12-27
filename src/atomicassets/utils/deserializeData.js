import {deserialize, ObjectSchema} from "atomicassets";

const deserializeData = ({
    schema,
    serializedData,
}) => {
    const objectSchema = ObjectSchema(schema);
    const deserializedData = deserialize(serializedData, objectSchema);

    return deserializedData;
};

export default deserializeData;
