export const characterOptionIds = {
  poses: ['fishing', 'sleeping', 'chatting', 'campfire-sit', 'standing'],
  headShapes: ['sphere', 'box', 'cone'],
  bodyShapes: ['box', 'cylinder', 'cone'],
  legShapes: ['box', 'cylinder'],
  accessories: ['hat', 'backpack', 'fishingRod', 'pillow', 'speechBubble', 'mug'],
} as const;

export type CharacterPoseOption = (typeof characterOptionIds.poses)[number];
export type HeadShapeOption = (typeof characterOptionIds.headShapes)[number];
export type BodyShapeOption = (typeof characterOptionIds.bodyShapes)[number];
export type LegShapeOption = (typeof characterOptionIds.legShapes)[number];
export type AccessoryOption = (typeof characterOptionIds.accessories)[number];

export type CharacterConfig = {
  pose: CharacterPoseOption;
  position: [number, number, number];
  rotation: [number, number, number];
  headShape: HeadShapeOption;
  bodyShape: BodyShapeOption;
  legShape: LegShapeOption;
  accessories: AccessoryOption[];
  colors: {
    skin: string;
    body: string;
    legs: string;
    feet: string;
    accessory: string;
  };
};

const isAllowed = <T extends readonly string[]>(optionIds: T, value: string): value is T[number] => optionIds.includes(value as T[number]);

export function validateCharacterConfig(config: CharacterConfig): CharacterConfig {
  if (!isAllowed(characterOptionIds.poses, config.pose)) {
    throw new Error(`Invalid pose option: ${config.pose}`);
  }

  if (!isAllowed(characterOptionIds.headShapes, config.headShape)) {
    throw new Error(`Invalid head shape option: ${config.headShape}`);
  }

  if (!isAllowed(characterOptionIds.bodyShapes, config.bodyShape)) {
    throw new Error(`Invalid body shape option: ${config.bodyShape}`);
  }

  if (!isAllowed(characterOptionIds.legShapes, config.legShape)) {
    throw new Error(`Invalid leg shape option: ${config.legShape}`);
  }

  config.accessories.forEach((accessory) => {
    if (!isAllowed(characterOptionIds.accessories, accessory)) {
      throw new Error(`Invalid accessory option: ${accessory}`);
    }
  });

  return config;
}
