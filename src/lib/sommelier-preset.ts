export interface PresetNode {
  id: string;
  type: string;
  content: string;
  detail: string;
  importance: number;
  category: string;
  sourceChunks: string[];
}

export interface PresetQuestion {
  id: string;
  knowledgeNodeId: string;
  type: 'multiple_choice' | 'fill_blank' | 'typed_recall' | 'matching' | 'ordering' | 'true_false';
  prompt: string;
  expectedAnswer: string;
  acceptableVariants?: string[];
  distractors?: { text: string; misconceptionReason?: string }[];
  options?: string[];
  difficulty: number;
  groundingChunk: string;
}

export interface PresetLesson {
  id: string;
  title: string;
  nodes: PresetNode[];
  questions: PresetQuestion[];
}

export const SOMMELIER_PRESET_SOURCE = {
  id: 'sommelier-wine-fundamentals',
  name: 'Wine Sommelier Fundamentals',
  type: 'sommelier_preset',
  normalized: `# Sommelier Wine Fundamentals

## 1. The 1855 Bordeaux Classification (Left Bank First Growths)
The official 1855 Bordeaux Classification established five First Growth (Premier Grand Cru Classé) châteaux in the Médoc and Graves:
1. Château Lafite Rothschild (Pauillac)
2. Château Latour (Pauillac)
3. Château Margaux (Margaux)
4. Château Haut-Brion (Pessac-Léognan / Graves)
5. Château Mouton Rothschild (Pauillac - elevated from 2nd Growth in 1973)

## 2. Classic Grape Varieties & Regions
- Pinot Noir: Native to Burgundy (Côte de Nuits & Côte de Beaune). High acidity, low-to-medium tannin, light-to-medium body, red fruit notes (cherry, raspberry, forest floor).
- Nebbiolo: Native to Piedmont, Italy (Barolo & Barbaresco). Translucent garnet color, high acidity, extremely high tannins, aromas of tar, roses, and sour cherry.
- Syrah / Shiraz: Northern Rhône (Hermitage, Côte-Rôtie - savory, pepper, smoked meat) vs Barossa Valley, Australia (jammy blackberry, chocolate, sweet spice).
- Sangiovese: Primary grape of Chianti Classico and Brunello di Montalcino in Tuscany. High acidity, firm tannin, notes of tart cherry, oregano, and dried herbs.

## 3. Sparkling Wine Production Methods
- Méthode Champenoise (Traditional Method): Secondary fermentation takes place inside the individual bottle. Requires autolytic aging on lees, riddling (remuage), and disgorgement (dégorgement). Used in Champagne, Cava, and Franciacorta.
- Charmat Method (Tank Method): Secondary fermentation takes place in large pressurized stainless steel tanks. Less autolytic character, preserves primary fruit aromas. Used in Prosecco.

## 4. Wine Chemistry & Common Faults
- Cork Taint (TCA / 2,4,6-Trichloroanisole): Caused by fungal interaction with chlorophenols in natural cork. Imparts wet cardboard, damp basement aromas, and strips fruit flavor.
- Volatile Acidity (VA): Caused by Acetobacter bacteria converting ethanol into acetic acid (vinegar) and ethyl acetate (nail polish remover).
- Oxidation: Excessive exposure to oxygen; turns white wines brown, strips fresh fruit, creates sherry-like bruised apple and nutty notes.

## 5. Food & Wine Pairing Principles
- Acid with Acid: High-acid wines (e.g., Sauvignon Blanc, Riesling) balance high-acid foods (lemon dressings, tomatoes) without tasting flabby.
- Tannin with Protein/Fat: High-tannin wines (Cabernet Sauvignon, Nebbiolo) bind to salivary proteins and fat in red meats, softening the tannin perception on the palate.
- Sweetness with Spice: Off-dry to sweet wines (Riesling, Gewürztraminer) tame fiery capsaicin heat in spicy dishes.`,
};

export const SOMMELIER_PRESET_LESSONS: PresetLesson[] = [
  {
    id: 'somm-lesson-1',
    title: 'Lesson 1: The 1855 Bordeaux First Growths',
    nodes: [
      {
        id: 'node-bordeaux-1855',
        type: 'fact',
        content: 'There are five 1855 First Growth (Premier Grand Cru Classé) Châteaux in Bordeaux.',
        detail: 'Lafite Rothschild, Latour, Margaux, Haut-Brion, and Mouton Rothschild.',
        importance: 5,
        category: 'memorize',
        sourceChunks: ['The official 1855 Bordeaux Classification established five First Growth...'],
      },
      {
        id: 'node-mouton-1973',
        type: 'fact',
        content: 'Château Mouton Rothschild was elevated to First Growth status in 1973.',
        detail: 'It is the only château ever elevated to Premier Grand Cru Classé after the 1855 classification.',
        importance: 4,
        category: 'memorize',
        sourceChunks: ['Château Mouton Rothschild (Pauillac - elevated from 2nd Growth in 1973)'],
      },
      {
        id: 'node-haut-brion-graves',
        type: 'fact',
        content: 'Château Haut-Brion is the only First Growth located outside the Médoc, in Graves (Pessac-Léognan).',
        detail: 'The other four First Growths are in the Médoc peninsula.',
        importance: 5,
        category: 'memorize',
        sourceChunks: ['Château Haut-Brion (Pessac-Léognan / Graves)'],
      }
    ],
    questions: [
      {
        id: 'q-somm-1-1',
        knowledgeNodeId: 'node-bordeaux-1855',
        type: 'multiple_choice',
        prompt: 'Which of the following is NOT one of the five 1855 Bordeaux First Growths (Premier Grand Cru Classé)?',
        expectedAnswer: 'Château Cheval Blanc',
        distractors: [
          { text: 'Château Lafite Rothschild', misconceptionReason: 'Lafite Rothschild is a First Growth' },
          { text: 'Château Margaux', misconceptionReason: 'Margaux is a First Growth' },
          { text: 'Château Latour', misconceptionReason: 'Latour is a First Growth' }
        ],
        difficulty: 2,
        groundingChunk: 'The official 1855 Bordeaux Classification established five First Growth...'
      },
      {
        id: 'q-somm-1-2',
        knowledgeNodeId: 'node-mouton-1973',
        type: 'typed_recall',
        prompt: 'In what year was Château Mouton Rothschild elevated from 2nd Growth to 1st Growth status?',
        expectedAnswer: '1973',
        acceptableVariants: ['1973', 'nineteen seventy three'],
        difficulty: 3,
        groundingChunk: 'elevated from 2nd Growth in 1973'
      },
      {
        id: 'q-somm-1-3',
        knowledgeNodeId: 'node-haut-brion-graves',
        type: 'multiple_choice',
        prompt: 'Which 1855 First Growth Château is located in Pessac-Léognan (Graves) rather than the Médoc?',
        expectedAnswer: 'Château Haut-Brion',
        distractors: [
          { text: 'Château Latour', misconceptionReason: 'Latour is in Pauillac (Médoc)' },
          { text: 'Château Margaux', misconceptionReason: 'Margaux is in Margaux (Médoc)' },
          { text: 'Château Lafite Rothschild', misconceptionReason: 'Lafite Rothschild is in Pauillac (Médoc)' }
        ],
        difficulty: 2,
        groundingChunk: 'Château Haut-Brion (Pessac-Léognan / Graves)'
      },
      {
        id: 'q-somm-1-4',
        knowledgeNodeId: 'node-bordeaux-1855',
        type: 'fill_blank',
        prompt: 'How many total châteaux currently hold 1855 Premier Grand Cru Classé (First Growth) status?',
        expectedAnswer: '5',
        acceptableVariants: ['5', 'five'],
        difficulty: 1,
        groundingChunk: 'five First Growth (Premier Grand Cru Classé) châteaux'
      },
      {
        id: 'q-somm-1-5',
        knowledgeNodeId: 'node-bordeaux-1855',
        type: 'true_false',
        prompt: 'True or False: Three of the five 1855 First Growth châteaux are located in the Pauillac appellation.',
        expectedAnswer: 'True',
        options: ['True', 'False'],
        difficulty: 2,
        groundingChunk: 'Lafite Rothschild (Pauillac), Latour (Pauillac), Mouton Rothschild (Pauillac)'
      },
      {
        id: 'q-somm-1-6',
        knowledgeNodeId: 'node-bordeaux-1855',
        type: 'multiple_choice',
        prompt: 'Which sub-region of Médoc houses both Château Lafite Rothschild and Château Latour?',
        expectedAnswer: 'Pauillac',
        distractors: [
          { text: 'Margaux', misconceptionReason: 'Houses Château Margaux' },
          { text: 'Saint-Julien', misconceptionReason: 'Houses 2nd-5th growths only' },
          { text: 'Saint-Estèphe', misconceptionReason: 'Houses 2nd-5th growths only' }
        ],
        difficulty: 2,
        groundingChunk: 'Lafite Rothschild (Pauillac), Latour (Pauillac)'
      },
      {
        id: 'q-somm-1-7',
        knowledgeNodeId: 'node-mouton-1973',
        type: 'true_false',
        prompt: 'True or False: Château Mouton Rothschild has been a First Growth since the original 1855 classification.',
        expectedAnswer: 'False',
        options: ['True', 'False'],
        difficulty: 2,
        groundingChunk: 'elevated from 2nd Growth in 1973'
      },
      {
        id: 'q-somm-1-8',
        knowledgeNodeId: 'node-haut-brion-graves',
        type: 'typed_recall',
        prompt: 'Name the sub-appellation of Graves where Château Haut-Brion is situated.',
        expectedAnswer: 'Pessac-Léognan',
        acceptableVariants: ['Pessac Leognan', 'Pessac-Leognan', 'Pessac'],
        difficulty: 3,
        groundingChunk: 'Château Haut-Brion (Pessac-Léognan / Graves)'
      },
      {
        id: 'q-somm-1-9',
        knowledgeNodeId: 'node-bordeaux-1855',
        type: 'multiple_choice',
        prompt: 'What year was the official Médoc wine classification ordered by Emperor Napoleon III?',
        expectedAnswer: '1855',
        distractors: [
          { text: '1900', misconceptionReason: 'Incorrect century' },
          { text: '1973', misconceptionReason: 'Year Mouton was elevated' },
          { text: '1935', misconceptionReason: 'Year AOC system was created' }
        ],
        difficulty: 1,
        groundingChunk: 'The official 1855 Bordeaux Classification'
      },
      {
        id: 'q-somm-1-10',
        knowledgeNodeId: 'node-bordeaux-1855',
        type: 'fill_blank',
        prompt: 'The 1855 classification categorized the top red wines of Bordeaux into _____ tiers of Grand Cru Classé.',
        expectedAnswer: '5',
        acceptableVariants: ['5', 'five'],
        difficulty: 2,
        groundingChunk: 'five First Growth / tiers'
      }
    ]
  },
  {
    id: 'somm-lesson-2',
    title: 'Lesson 2: Key Grape Varieties & Terroir',
    nodes: [
      {
        id: 'node-pinot-noir',
        type: 'concept',
        content: 'Pinot Noir exhibits translucent color, high acidity, low-to-medium tannins, and red fruit/forest floor characteristics.',
        detail: 'Native to Burgundy (Côte de Nuits & Côte de Beaune).',
        importance: 5,
        category: 'understand',
        sourceChunks: ['Pinot Noir: Native to Burgundy... High acidity, low-to-medium tannin']
      },
      {
        id: 'node-nebbiolo',
        type: 'concept',
        content: 'Nebbiolo is characterized by pale garnet color paired with unexpectedly high acid and high tannins, showing tar and rose aromas.',
        detail: 'Native to Barolo and Barbaresco in Piedmont, Italy.',
        importance: 5,
        category: 'understand',
        sourceChunks: ['Nebbiolo: Native to Piedmont, Italy (Barolo & Barbaresco)... high acidity, extremely high tannins']
      },
      {
        id: 'node-syrah-rhone-barossa',
        type: 'distinction',
        content: 'Northern Rhône Syrah is savory, peppery, and lean, whereas Barossa Valley Shiraz is opulent, jammy, and sweet-spiced.',
        detail: 'Climate difference: cooler continental/Mediterranean vs hot dry Australian climate.',
        importance: 4,
        category: 'understand',
        sourceChunks: ['Northern Rhône (Hermitage, Côte-Rôtie - savory, pepper, smoked meat) vs Barossa Valley']
      }
    ],
    questions: [
      {
        id: 'q-somm-2-1',
        knowledgeNodeId: 'node-nebbiolo',
        type: 'multiple_choice',
        prompt: 'Which Italian grape variety is famed for aromas of "tar and roses" combined with high acidity and fierce tannins despite a pale color?',
        expectedAnswer: 'Nebbiolo',
        distractors: [
          { text: 'Sangiovese', misconceptionReason: 'Sangiovese shows sour cherry and herbs' },
          { text: 'Barbera', misconceptionReason: 'Barbera has high acid but low tannin' },
          { text: 'Corvina', misconceptionReason: 'Used in Valpolicella' }
        ],
        difficulty: 2,
        groundingChunk: 'Nebbiolo: Native to Piedmont... high acidity, extremely high tannins, aromas of tar, roses'
      },
      {
        id: 'q-somm-2-2',
        knowledgeNodeId: 'node-pinot-noir',
        type: 'typed_recall',
        prompt: 'Name the French region considered the ancestral home of Pinot Noir.',
        expectedAnswer: 'Burgundy',
        acceptableVariants: ['Bourgogne', 'Burgundy'],
        difficulty: 1,
        groundingChunk: 'Pinot Noir: Native to Burgundy'
      },
      {
        id: 'q-somm-2-3',
        knowledgeNodeId: 'node-syrah-rhone-barossa',
        type: 'multiple_choice',
        prompt: 'Which sensory profile best describes a classic Syrah from Hermitage in the Northern Rhône?',
        expectedAnswer: 'Savory, black pepper, and smoked meat notes with firm structure',
        distractors: [
          { text: 'Jammy blackberry pie, chocolate, and high alcohol', misconceptionReason: 'Describes Barossa Shiraz' },
          { text: 'Light body, red cherry, and wet forest floor', misconceptionReason: 'Describes Pinot Noir' },
          { text: 'Sour cherry, oregano, and dried herbs', misconceptionReason: 'Describes Sangiovese' }
        ],
        difficulty: 3,
        groundingChunk: 'Northern Rhône (Hermitage, Côte-Rôtie - savory, pepper, smoked meat)'
      },
      {
        id: 'q-somm-2-4',
        knowledgeNodeId: 'node-pinot-noir',
        type: 'true_false',
        prompt: 'True or False: Pinot Noir is typically characterized by opaque, deep purple color and high tannin levels.',
        expectedAnswer: 'False',
        options: ['True', 'False'],
        difficulty: 1,
        groundingChunk: 'Pinot Noir... low-to-medium tannin, light-to-medium body'
      },
      {
        id: 'q-somm-2-5',
        knowledgeNodeId: 'node-nebbiolo',
        type: 'fill_blank',
        prompt: 'The classic Italian DOCG regions of Barolo and Barbaresco are produced 100% from the _____ grape.',
        expectedAnswer: 'Nebbiolo',
        acceptableVariants: ['Nebbiolo'],
        difficulty: 2,
        groundingChunk: 'Nebbiolo: Native to Piedmont, Italy (Barolo & Barbaresco)'
      },
      {
        id: 'q-somm-2-6',
        knowledgeNodeId: 'node-syrah-rhone-barossa',
        type: 'typed_recall',
        prompt: 'Which famous Australian wine region is renowned for rich, full-bodied Shiraz with ripe blackberry and chocolate flavors?',
        expectedAnswer: 'Barossa Valley',
        acceptableVariants: ['Barossa', 'Barossa Valley'],
        difficulty: 2,
        groundingChunk: 'Barossa Valley, Australia (jammy blackberry, chocolate, sweet spice)'
      },
      {
        id: 'q-somm-2-7',
        knowledgeNodeId: 'node-pinot-noir',
        type: 'multiple_choice',
        prompt: 'Which two sub-regions of Burgundy are famous for producing world-class Pinot Noir?',
        expectedAnswer: 'Côte de Nuits & Côte de Beaune',
        distractors: [
          { text: 'Chablis & Mâconnais', misconceptionReason: 'Renowned for Chardonnay' },
          { text: 'Beaujolais & Côte Chalonnaise', misconceptionReason: 'Beaujolais is famous for Gamay' },
          { text: 'Graves & Médoc', misconceptionReason: 'Bordeaux Cabernet/Merlot regions' }
        ],
        difficulty: 2,
        groundingChunk: 'Côte de Nuits & Côte de Beaune'
      },
      {
        id: 'q-somm-2-8',
        knowledgeNodeId: 'node-nebbiolo',
        type: 'multiple_choice',
        prompt: 'What characteristic visual trait distinguishes aged Nebbiolo in the glass?',
        expectedAnswer: 'Translucent brick/garnet color with orange rim reflections',
        distractors: [
          { text: 'Inky blue-black opacity with purple rim', misconceptionReason: 'Describes Syrah or Malbec' },
          { text: 'Bright magenta hue with slow legs', misconceptionReason: 'Describes Gamay or Beaujolais' },
          { text: 'Pale straw yellow with green highlights', misconceptionReason: 'Describes white wine' }
        ],
        difficulty: 2,
        groundingChunk: 'Translucent garnet color'
      },
      {
        id: 'q-somm-2-9',
        knowledgeNodeId: 'node-syrah-rhone-barossa',
        type: 'true_false',
        prompt: 'True or False: Syrah and Shiraz are the exact same grape variety genetically.',
        expectedAnswer: 'True',
        options: ['True', 'False'],
        difficulty: 1,
        groundingChunk: 'Syrah / Shiraz'
      },
      {
        id: 'q-somm-2-10',
        knowledgeNodeId: 'node-pinot-noir',
        type: 'fill_blank',
        prompt: 'Primary fruit descriptors for young Pinot Noir focus on _____ fruit notes like cherry and raspberry.',
        expectedAnswer: 'red',
        acceptableVariants: ['red'],
        difficulty: 1,
        groundingChunk: 'red fruit notes (cherry, raspberry, forest floor)'
      }
    ]
  },
  {
    id: 'somm-lesson-3',
    title: 'Lesson 3: Sparkling Wine Methods & Wine Faults',
    nodes: [
      {
        id: 'node-methode-champenoise',
        type: 'procedure',
        content: 'Méthode Champenoise (Traditional Method) conducts secondary fermentation inside the bottle, imparting autolytic (bready, brioche) aromas.',
        detail: 'Involves lees aging, riddling (remuage), disgorgement (dégorgement), and dosage.',
        importance: 5,
        category: 'understand',
        sourceChunks: ['Méthode Champenoise (Traditional Method): Secondary fermentation takes place inside the individual bottle.']
      },
      {
        id: 'node-tca-fault',
        type: 'concept',
        content: 'Cork Taint (TCA) creates damp cardboard/basement aromas and strips wine of fresh fruit flavors.',
        detail: 'Caused by 2,4,6-Trichloroanisole contamination from infected natural corks.',
        importance: 5,
        category: 'memorize',
        sourceChunks: ['Cork Taint (TCA / 2,4,6-Trichloroanisole): Caused by fungal interaction with chlorophenols in natural cork.']
      },
      {
        id: 'node-pairing-tannin-fat',
        type: 'rule',
        content: 'Tannic wines pair best with high-protein and high-fat foods, which soften the astringency of tannins.',
        detail: 'Tannins bind to salivary proteins and fat molecules.',
        importance: 4,
        category: 'understand',
        sourceChunks: ['Tannin with Protein/Fat: High-tannin wines... bind to salivary proteins and fat']
      }
    ],
    questions: [
      {
        id: 'q-somm-3-1',
        knowledgeNodeId: 'node-methode-champenoise',
        type: 'multiple_choice',
        prompt: 'Where does secondary fermentation occur in the Méthode Champenoise (Traditional Method)?',
        expectedAnswer: 'Inside the individual bottle',
        distractors: [
          { text: 'In large pressurized stainless steel tanks', misconceptionReason: 'Describes the Charmat Method' },
          { text: 'In concrete egg fermenters', misconceptionReason: 'Used for primary fermentation in some still wines' },
          { text: 'In open oak vats', misconceptionReason: 'Used for still red wine maceration' }
        ],
        difficulty: 1,
        groundingChunk: 'Secondary fermentation takes place inside the individual bottle.'
      },
      {
        id: 'q-somm-3-2',
        knowledgeNodeId: 'node-tca-fault',
        type: 'typed_recall',
        prompt: 'What chemical compound causes cork taint, imparting aromas of wet cardboard and damp cellar?',
        expectedAnswer: 'TCA',
        acceptableVariants: ['TCA', 'Trichloroanisole', '2,4,6-Trichloroanisole'],
        difficulty: 3,
        groundingChunk: 'Cork Taint (TCA / 2,4,6-Trichloroanisole)'
      },
      {
        id: 'q-somm-3-3',
        knowledgeNodeId: 'node-pairing-tannin-fat',
        type: 'multiple_choice',
        prompt: 'Why does a heavily tannic Cabernet Sauvignon pair effectively with a fatty ribeye steak?',
        expectedAnswer: 'Tannins bind to fat and salivary proteins, reducing perceived astringency on the palate',
        distractors: [
          { text: 'The fat lowers the alcohol content of the wine during mastication', misconceptionReason: 'Physically incorrect' },
          { text: 'High tannins increase sweetness perception when mixed with salt', misconceptionReason: 'Incorrect taste interaction' },
          { text: 'Tannins neutralize the heat of black pepper on steak', misconceptionReason: 'Describes sugar/capsaicin pairing' }
        ],
        difficulty: 2,
        groundingChunk: 'High-tannin wines... bind to salivary proteins and fat in red meats, softening the tannin'
      },
      {
        id: 'q-somm-3-4',
        knowledgeNodeId: 'node-methode-champenoise',
        type: 'fill_blank',
        prompt: 'The process of collecting dead yeast cells (lees) in the neck of the bottle prior to disgorgement is called _____ (remuage).',
        expectedAnswer: 'riddling',
        acceptableVariants: ['riddling', 'remuage'],
        difficulty: 2,
        groundingChunk: 'riddling (remuage)'
      },
      {
        id: 'q-somm-3-5',
        knowledgeNodeId: 'node-tca-fault',
        type: 'true_false',
        prompt: 'True or False: A corked wine (TCA fault) is dangerous to consume toxicologically.',
        expectedAnswer: 'False',
        options: ['True', 'False'],
        difficulty: 1,
        groundingChunk: 'Cork Taint affects aroma and flavor, but is non-toxic'
      },
      {
        id: 'q-somm-3-6',
        knowledgeNodeId: 'node-methode-champenoise',
        type: 'multiple_choice',
        prompt: 'Which sparkling wine method is primarily used for producing Prosecco in Italy?',
        expectedAnswer: 'Charmat Method (Tank Method)',
        distractors: [
          { text: 'Méthode Champenoise', misconceptionReason: 'Used for Champagne and Cava' },
          { text: 'Ancestral Method (Pet-Nat)', misconceptionReason: 'Single continuous fermentation' },
          { text: 'Carbonization Method', misconceptionReason: 'Artificial CO2 injection' }
        ],
        difficulty: 2,
        groundingChunk: 'Charmat Method (Tank Method)... Used in Prosecco.'
      },
      {
        id: 'q-somm-3-7',
        knowledgeNodeId: 'node-tca-fault',
        type: 'multiple_choice',
        prompt: 'Which aroma descriptor is most indicative of volatile acidity (VA) in wine?',
        expectedAnswer: 'Vinegar or nail polish remover',
        distractors: [
          { text: 'Wet dog or damp cardboard', misconceptionReason: 'Describes Cork Taint (TCA)' },
          { text: 'Burnt rubber or rotten eggs', misconceptionReason: 'Describes Reduction / Hydrogen Sulfide' },
          { text: 'Bruised apple or sherry notes', misconceptionReason: 'Describes Oxidation' }
        ],
        difficulty: 2,
        groundingChunk: 'acetic acid (vinegar) and ethyl acetate (nail polish remover)'
      },
      {
        id: 'q-somm-3-8',
        knowledgeNodeId: 'node-pairing-tannin-fat',
        type: 'fill_blank',
        prompt: 'To tame spicy dishes containing capsaicin, sommelier principles recommend pairing wines with elevated _____ levels.',
        expectedAnswer: 'sugar',
        acceptableVariants: ['sugar', 'sweetness', 'off-dry'],
        difficulty: 2,
        groundingChunk: 'Off-dry to sweet wines (Riesling, Gewürztraminer) tame fiery capsaicin heat'
      },
      {
        id: 'q-somm-3-9',
        knowledgeNodeId: 'node-methode-champenoise',
        type: 'typed_recall',
        prompt: 'What French term refers to the removal of the frozen yeast plug from the bottle neck during Champagne production?',
        expectedAnswer: 'disgorgement',
        acceptableVariants: ['disgorgement', 'degorgement', 'dégorgement'],
        difficulty: 3,
        groundingChunk: 'disgorgement (dégorgement)'
      },
      {
        id: 'q-somm-3-10',
        knowledgeNodeId: 'node-pairing-tannin-fat',
        type: 'true_false',
        prompt: 'True or False: High-acid wines like Sauvignon Blanc tend to taste flat and flabby when paired with acidic food dishes.',
        expectedAnswer: 'False',
        options: ['True', 'False'],
        difficulty: 1,
        groundingChunk: 'High-acid wines... balance high-acid foods... without tasting flabby'
      }
    ]
  }
];
