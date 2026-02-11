export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  color: string;
};

export const people: Person[] = [
  { id: 'alex-kim', firstName: 'Alex', lastName: 'Kim', role: 'PhD Student', color: '#ff8fab' },
  { id: 'chris-ng', firstName: 'Chris', lastName: 'Ng', role: 'Research Engineer', color: '#9bf6ff' },
  { id: 'jordan-singh', firstName: 'Jordan', lastName: 'Singh', role: 'Postdoc', color: '#bdb2ff' },
  { id: 'maya-lee', firstName: 'Maya', lastName: 'Lee', role: 'Professor', color: '#ffd6a5' },
  { id: 'ravi-patel', firstName: 'Ravi', lastName: 'Patel', role: 'Designer', color: '#caffbf' },
  { id: 'sam-zhou', firstName: 'Sam', lastName: 'Zhou', role: 'RA', color: '#f1c0e8' },
];

export const getAlphabeticalPeople = (): Person[] =>
  [...people].sort((a, b) => {
    const lastNameCompare = a.lastName.localeCompare(b.lastName);
    if (lastNameCompare !== 0) {
      return lastNameCompare;
    }

    return a.firstName.localeCompare(b.firstName);
  });
