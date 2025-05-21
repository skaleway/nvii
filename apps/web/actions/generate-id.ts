import shortuniqueid from "short-unique-id";

export function generateId() {
  const { randomUUID } = new shortuniqueid({ length: 10 });

  const id = randomUUID();

  return id;
}
