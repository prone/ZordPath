// French translations for ZordPath
registerLanguage('fr', 'Francais', '\u{1F1EB}\u{1F1F7}', {
    pushStart: 'NOUVELLE PARTIE', continue: 'Continuer', correct: 'Correct !', incorrect: 'Incorrect !',
    tryAgain: 'Reessayer', next: 'Suivant', back: 'Retour', viewDiagram: 'Voir le Diagramme',
    startQuiz: 'Commencer le Quiz !', fight: 'COMBAT', zord: 'ZORD', item: 'OBJET', run: 'FUIR',
    attack: 'Attaquer', switchZord: 'Changer de Zord', retreat: 'Retraite', potion: 'Potion',
    deploy: 'Deployer', catch: 'Capturer', block: 'Bloquer', action: 'ACTION', talk: 'PARLER',
    inventory: 'INV', map: 'CARTE', help: 'AIDE', quiz: 'QUIZ',
    leaveStore: 'Quitter le Magasin', buy: 'Acheter', soldOut: 'EPUISE', rubies: 'Rubis',
    healAll: 'Soigner tous les Zords', free: 'GRATUIT', confirm: 'Confirmer', cancel: 'Annuler',
    close: 'Fermer', save: 'Sauvegarder', delete: 'Supprimer', emptySlot: 'Emplacement Vide',
    enterHouse: 'Entrer dans la Maison', enterStore: 'Entrer dans le Magasin', enterArena: 'Entrer dans l\'Arene',
    readSign: 'Lire le Panneau', fishHere: 'Pecher ici', enter: 'Entrer', search: 'Chercher',
    exit: 'Sortir', zordHospital: 'Hopital Zord', zordSpa: 'Spa Zord',
    testing: 'TEST', levelUp: 'NIVEAU SUPERIEUR !', reportCard: 'BULLETIN SCOLAIRE',
    strengths: 'Points Forts', needsPractice: 'A Travailler',
    mostMissed: 'Questions les Plus Ratees', downloadPdf: 'Telecharger PDF',
    overallScore: 'Score Global', student: 'Eleve', date: 'Date',
    topic: 'Introduction a la Logique', playTime: 'Temps de Jeu',
    slide: 'Diapositive', of: 'sur', question: 'Question', score: 'Score',
    streak: 'Serie', lives: 'Vies', bankQuit: 'Encaisser et Quitter',
    challengeComplete: 'Defi Termine !', gameOver: 'Fin de Partie !',
    runesCollected: 'Runes de Logique', zordsCaught: 'Zords Captures',
    sailToIsland: 'Naviguer vers l\'Ile !', sailToBeach: 'Retour a la Plage',
    sailingToIsland: 'Navigation vers l\'Ile Mysterieuse...', sailingToBeach: 'Retour a Coral Cove...',
    perfectCast: 'Lancer parfait !', goodCast: 'Bon lancer !',
    waitingBite: 'En attente d\'une touche...', fishOn: 'CA MORD !',
    easyReel: 'Lancer parfait - facile !', mashSpace: 'Appuyez sur Espace pour mouliner !',
    nothingHere: 'Rien a trouver ici.', alreadyCollected: 'Vous avez deja cette rune.',
    wrongAnswer: 'Faux !', correctAnswer: 'Correct !', theAnswerIs: 'La reponse est :',
    comeBackLater: 'Revenez et reessayez !', catchSuccessful: 'Capture reussie !',
    brokeFree: 's\'est libere !', escaped: 'Echappe !', defeated: 'vaincu !',
    victory: 'Victoire !', youWereDefeated: 'Vous avez ete vaincu...',
    caught: 'CAPTURE !', giveNickname: 'Donnez-lui un surnom :',
    chooseZord: 'Choisissez un Zord a deployer !',
    yourZordFainted: 'Votre Zord est KO ! Choisissez-en un autre !',
    allZordsFainted: 'Tous vos Zords sont KO !',
    cantRunArena: 'Impossible de fuir un combat d\'Arene !',
    noZords: 'Vous n\'avez pas encore de Zords !', startChallenge: 'Commencer le Defi !',
    tellMeMore: 'Dis-moi en plus', notNow: 'Pas maintenant',
    returnToTown: 'Retour au Village', returnToArena: 'Retour a l\'Arene',
    startTraining: 'Commencer l\'Entrainement', backToSpa: 'Retour au Spa',
    trainingComplete: 'Entrainement Termine !', addToBench: 'Ajouter a l\'Equipe',
    removeFromBench: 'Retirer', benchFull: 'Equipe Pleine',
    challenge: 'Defier', rematch: 'Revanche',
    theLegendOf: 'LA  LEGENDE  DE',
    worldsOfKnowledge: 'MONDES DU SAVOIR',
    emptySlotN: 'Emplacement Vide',
    selectLanguage: 'Langue'
});

// French lesson translations
LANGUAGES.fr.lessons = {
  'propositional-basics': {
    title: 'Vrai ou Faux ? Les propositions en logique',
    content: `En logique, on travaille avec des PROPOSITIONS — des phrases qui sont soit VRAIES, soit FAUSSES. C'est tout ! Chaque proposition doit être l'une ou l'autre.

Voici quelques exemples :
- "Les chiens sont des animaux." --> C'est VRAI !
- "Le Soleil est froid." --> C'est FAUX !
- "2 + 3 = 5" --> C'est VRAI !
- "Les poissons peuvent voler." --> C'est FAUX !

Attention ! Tout n'est pas une proposition :
- "Comment tu t'appelles ?" est une QUESTION, pas une proposition.
- "Ferme la fenêtre !" est un ORDRE, pas une proposition.
- "Ouah !" est juste une exclamation.

Seules les phrases qui peuvent être VRAIES ou FAUSSES comptent comme propositions en logique.

On peut aussi combiner des propositions avec des mots spéciaux :
- ET : Les deux choses doivent être vraies. "Il fait soleil ET il fait chaud" n'est vrai que si LES DEUX parties sont vraies.
- NON : Cela inverse la réponse. Si "Il pleut" est VRAI, alors "Il ne pleut PAS" est FAUX.`,
    questions: [
      { q: 'Laquelle de ces phrases est une proposition (quelque chose qui est vrai ou faux) ?', choices: ['"Quel âge as-tu ?"', '"Assieds-toi !"', '"Les chats ont quatre pattes."', '"Hourra !"'], answer: 2 },
      { q: '"Il fait soleil ET c\'est lundi." Quand est-ce que c\'est vrai ?', choices: ['Seulement quand il fait soleil', 'Seulement quand c\'est lundi', 'Quand LES DEUX sont vrais', 'Quand l\'un ou l\'autre est vrai'], answer: 2 },
      { q: 'Si "Le chien dort" est VRAI, que vaut "Le chien ne dort PAS" ?', choices: ['VRAI', 'FAUX', 'Peut-être', 'On ne peut pas savoir'], answer: 1 },
      { q: '"7 est plus grand que 10." Est-ce une proposition ?', choices: ['Non, parce que c\'est faux', 'Oui — c\'est FAUX mais c\'est quand même une proposition', 'Non, c\'est une question', 'Seulement si on le croit'], answer: 1 },
      { q: '"J\'aime la pizza ET j\'aime les tacos." J\'aime la pizza mais je déteste les tacos. Est-ce vrai ?', choices: ['VRAI — la pizza suffit', 'FAUX — les deux doivent être vrais pour ET', 'Peut-être', 'Seulement le vendredi'], answer: 1 },
      { q: 'Si "Il pleut" est FAUX, que vaut "Il ne pleut PAS" ?', choices: ['FAUX', 'VRAI', 'Peut-être', 'Ça dépend du temps'], answer: 1 },
      { q: '"Le ciel est vert." Est-ce une proposition ?', choices: ['Non, parce que c\'est absurde', 'Non, parce que c\'est faux', 'Oui — elle peut être VRAIE ou FAUSSE', 'Parfois seulement'], answer: 2 },
      { q: '"Range ta chambre ET fais tes devoirs." Que dois-tu faire ?', choices: ['Un seul des deux', 'L\'un ou l\'autre', 'LES DEUX', 'Aucun des deux — ce n\'est pas une proposition'], answer: 2 },
      { q: 'NON NON VRAI est égal à :', choices: ['VRAI', 'FAUX', 'PEUT-ÊTRE', 'ERREUR'], answer: 0 },
      { q: '"J\'ai faim ET j\'ai soif ET je suis fatigué." Les trois sont vrais sauf que je n\'ai PAS soif. L\'ensemble est-il vrai ?', choices: ['VRAI — deux sur trois suffisent', 'FAUX — TOUT doit être vrai pour ET', 'VRAI — la majorité l\'emporte', 'On ne peut pas savoir'], answer: 1 },
      { q: 'Laquelle de ces phrases n\'est PAS une proposition ?', choices: ['"Les éléphants peuvent voler."', '"2 + 2 = 4"', '"Ouvre la fenêtre !"', '"La Lune est faite de roche."'], answer: 2 },
      { q: '"La Terre est ronde ET l\'eau est mouillée." Est-ce vrai ?', choices: ['FAUX — la Terre n\'est pas parfaitement ronde', 'VRAI — les deux parties sont vraies', 'Il nous faut plus d\'informations', 'Une seule est vraie'], answer: 1 },
      { q: 'Si NON FAUX est VRAI, que vaut NON VRAI ?', choices: ['VRAI', 'NON', 'FAUX', 'PEUT-ÊTRE'], answer: 2 }
    ]
  },

  'truth-tables': {
    title: 'ET et OU — Combiner des idées',
    content: `Apprenons deux façons importantes de combiner des propositions : ET et OU !

ET signifie que LES DEUX choses doivent être vraies :
- "J'ai un chat ET un chien" est VRAI seulement si tu as LES DEUX un chat et un chien.
- Si tu as seulement un chat mais pas de chien, l'ensemble est FAUX.

Pense-y comme une liste de contrôle où TOUT doit être coché !

OU signifie qu'AU MOINS UNE chose doit être vraie :
- "Je mangerai de la pizza OU des pâtes" est VRAI si tu manges de la pizza, ou des pâtes, ou même les deux !
- C'est seulement FAUX si tu ne manges NI pizza NI pâtes.

Pense-y comme une liste où tu as besoin d'au moins UNE coche !

Entraînons-nous :
- "Il pleut OU il fait soleil"
  - Pluie et soleil ? VRAI (au moins un est vrai — les deux le sont !)
  - Pluie mais pas soleil ? VRAI (la pluie compte !)
  - Pas de pluie mais soleil ? VRAI (le soleil compte !)
  - Pas de pluie et pas de soleil ? FAUX (ni l'un ni l'autre n'est vrai !)`,
    questions: [
      { q: '"J\'aime le chocolat OU j\'aime la vanille." J\'aime le chocolat mais pas la vanille. Est-ce vrai ?', choices: ['FAUX — je dois aimer les deux', 'VRAI — j\'en aime au moins un', 'On ne peut pas savoir', 'Parfois seulement'], answer: 1 },
      { q: '"Je suis grand ET je suis rapide." Je suis grand mais je ne suis pas rapide. Est-ce vrai ?', choices: ['VRAI', 'FAUX', 'Peut-être', 'Seulement le mardi'], answer: 1 },
      { q: '"J\'ai un vélo OU une trottinette." Je n\'ai ni l\'un ni l\'autre. Est-ce vrai ?', choices: ['VRAI', 'FAUX', 'Peut-être', 'Ça dépend'], answer: 1 },
      { q: 'Que signifie OU en logique ?', choices: ['Les deux doivent être vrais', 'Exactement un doit être vrai', 'Au moins un doit être vrai', 'Aucun n\'est vrai'], answer: 2 },
      { q: '"J\'aime le rouge OU j\'aime le bleu." J\'aime LES DEUX le rouge et le bleu. Est-ce vrai ?', choices: ['FAUX — tu ne peux en choisir qu\'un', 'VRAI — au moins un est vrai', 'FAUX — OU signifie un seul', 'Ça dépend'], answer: 1 },
      { q: '"J\'ai un chien ET un chat OU un poisson." J\'ai un chien et un poisson mais pas de chat. Est-ce vrai ?', choices: ['VRAI', 'FAUX', 'Il nous faut plus d\'info', 'Seulement si ET vient en premier'], answer: 0 },
      { q: '"Il pleut OU il neige." Il ne se passe ni l\'un ni l\'autre. Est-ce vrai ?', choices: ['VRAI', 'FAUX', 'Peut-être plus tard', 'Seulement en hiver'], answer: 1 },
      { q: 'Lequel est PLUS FACILE à rendre vrai : "A ET B" ou "A OU B" ?', choices: ['ET est plus facile', 'OU est plus facile — un seul doit être vrai', 'Ils sont pareils', 'Ni l\'un ni l\'autre ne peut être vrai'], answer: 1 },
      { q: '"J\'apporterai une veste ET un parapluie." J\'apporte une veste mais j\'oublie le parapluie. Ai-je tenu ma promesse ?', choices: ['Oui, une veste suffit', 'Non — ET signifie que j\'avais besoin des deux', 'Oui, c\'est presque ça', 'Seulement s\'il pleut'], answer: 1 },
      { q: '"La réponse est 5 OU la réponse est 7." La réponse est 5. La proposition est-elle vraie ?', choices: ['FAUX — parce que ce n\'est pas 7', 'VRAI — 5 est l\'une des options', 'FAUX — les deux doivent correspondre', 'Il nous faut la question'], answer: 1 },
      { q: 'VRAI ET VRAI est égal à :', choices: ['FAUX', 'VRAI', 'PEUT-ÊTRE', 'LES DEUX'], answer: 1 },
      { q: 'FAUX ET VRAI est égal à :', choices: ['VRAI', 'FAUX', 'PEUT-ÊTRE', 'VRAI ET FAUX'], answer: 1 },
      { q: 'FAUX OU FAUX est égal à :', choices: ['VRAI', 'FAUX', 'PEUT-ÊTRE', 'OU'], answer: 1 },
      { q: '"J\'ai mangé le petit-déjeuner OU le déjeuner OU le dîner." J\'ai seulement mangé le déjeuner. Est-ce vrai ?', choices: ['FAUX — j\'ai manqué deux repas', 'VRAI — au moins un est vrai', 'FAUX — il me faut les trois', 'Seulement si le déjeuner était copieux'], answer: 1 }
    ]
  },

  'implication': {
    title: 'Les énoncés Si-Alors',
    content: `L'une des idées les plus puissantes en logique est l'énoncé SI-ALORS !

"S'il pleut, ALORS j'apporterai un parapluie."

La partie SI s'appelle la CONDITION. La partie ALORS s'appelle le RÉSULTAT.

Voici la partie délicate — quand un énoncé si-alors est-il FAUX ?

Il est SEULEMENT faux quand la partie SI se produit mais que la partie ALORS NE se produit PAS :
- Il pleut et j'apporte un parapluie = VRAI (j'ai tenu ma promesse !)
- Il pleut et je n'apporte PAS de parapluie = FAUX (j'ai rompu ma promesse !)
- Il ne pleut pas et j'apporte un parapluie = VRAI (je n'ai rompu aucune promesse !)
- Il ne pleut pas et je n'apporte pas de parapluie = VRAI (Pas de promesse à rompre !)

Pense à ça comme une PROMESSE : "Si tu ranges ta chambre, alors tu auras une glace."
- Tu ranges et tu as une glace ? Promesse tenue ! VRAI !
- Tu ranges mais tu n'as PAS de glace ? Promesse rompue ! FAUX !
- Tu ne ranges pas mais tu as quand même une glace ? La promesse n'est pas rompue ! VRAI !
- Tu ne ranges pas et pas de glace ? La promesse n'est toujours pas rompue ! VRAI !

La promesse n'est rompue que quand tu FAIS la première chose mais que tu N'OBTIENS PAS la deuxième.`,
    questions: [
      { q: '"S\'il neige, alors l\'école est annulée." Il neige et l\'école EST annulée. L\'énoncé est-il vrai ?', choices: ['VRAI', 'FAUX', 'On ne peut pas savoir', 'Parfois seulement'], answer: 0 },
      { q: '"S\'il neige, alors l\'école est annulée." Il neige mais l\'école N\'est PAS annulée. L\'énoncé est-il vrai ?', choices: ['VRAI', 'FAUX', 'On ne peut pas savoir', 'Parfois seulement'], answer: 1 },
      { q: '"Si tu manges tes légumes, tu auras un dessert." Tu ne manges PAS tes légumes mais tu as quand même un dessert. La promesse est-elle rompue ?', choices: ['Oui, la promesse est rompue', 'Non, la promesse N\'est PAS rompue', 'On ne peut pas savoir', 'Ce n\'est pas juste !'], answer: 1 },
      { q: 'Un énoncé si-alors est seulement FAUX quand :', choices: ['La partie SI est fausse', 'La partie ALORS est vraie', 'La partie SI est vraie mais la partie ALORS est fausse', 'Les deux parties sont fausses'], answer: 2 },
      { q: '"Si j\'étudie, je réussirai." Je n\'étudie pas et je ne réussis pas. La promesse est-elle rompue ?', choices: ['Oui — j\'ai échoué !', 'Non — la promesse ne couvre que ce qui arrive SI j\'étudie', 'Oui — j\'aurais dû étudier', 'On ne peut pas savoir'], answer: 1 },
      { q: '"Si c\'est un carré, alors il a 4 côtés." C\'est :', choices: ['FAUX — toutes les formes à 4 côtés ne sont pas des carrés', 'VRAI — chaque carré a bien 4 côtés', 'Vrai seulement parfois', 'FAUX — les carrés ont des angles, pas des côtés'], answer: 1 },
      { q: '"Si j\'appuie sur le bouton, la lumière s\'allume." La lumière est déjà allumée et je n\'ai jamais appuyé sur le bouton. Est-ce faux ?', choices: ['Oui — la lumière ne devrait pas être allumée', 'Non — la promesse n\'est rompue que si j\'appuie et qu\'elle reste éteinte', 'Oui — il y a un problème', 'Il nous faut plus d\'info'], answer: 1 },
      { q: '"Si tu es un chien, alors tu es un animal." Max est un chat (un animal). Cela rompt-il la règle ?', choices: ['Oui — Max n\'est pas un chien', 'Non — la règle ne parle que des chiens, pas des chats', 'Oui — les chats et les chiens sont différents', 'Seulement si Max aboie'], answer: 1 },
      { q: '"S\'il pleut, j\'apporte un parapluie." Il fait soleil et j\'apporte quand même un parapluie. VRAI ou FAUX ?', choices: ['FAUX — pas de pluie signifie pas de parapluie', 'VRAI — je n\'ai pas rompu ma promesse', 'FAUX — les parapluies sont pour la pluie', 'Ça dépend du temps'], answer: 1 },
      { q: 'Laquelle de ces situations rendrait "Si A alors B" FAUX ?', choices: ['A est faux, B est faux', 'A est faux, B est vrai', 'A est vrai, B est vrai', 'A est vrai, B est faux'], answer: 3 },
      { q: '"Si tu finis ton dîner, tu auras un dessert." Tu finis ton dîner. Tu DOIS obtenir :', choices: ['Rien', 'Un dessert', 'Encore du dîner', 'Une boisson'], answer: 1 },
      { q: '"Si c\'est samedi, il n\'y a pas d\'école." Aujourd\'hui c\'est mercredi et il Y A école. L\'énoncé est-il faux ?', choices: ['Oui — il y a école aujourd\'hui', 'Non — la règle concerne le samedi, pas le mercredi', 'Oui — l\'école est ouverte', 'Seulement en été'], answer: 1 },
      { q: '"Si je suis plus grand que toi, et que tu es plus grand que Sam, alors je suis plus grand que Sam." Est-ce un bon raisonnement ?', choices: ['Non, la taille ne fonctionne pas comme ça', 'Oui — si A > B et B > C, alors A > C', 'Seulement si tout le monde est debout', 'Il faut mesurer'], answer: 1 },
      { q: 'Combien de façons "Si P alors Q" peut-il être VRAI ?', choices: ['1 seule façon', '2 façons', '3 façons', '4 façons'], answer: 2 }
    ]
  },

  'equivalence': {
    title: 'Dire la même chose de différentes façons',
    content: `Parfois deux énoncés qui SEMBLENT différents veulent en fait dire la MÊME chose ! Quand deux propositions ont toujours la même réponse (les deux vraies ou les deux fausses), on dit qu'elles sont ÉQUIVALENTES.

Voici une astuce très utile appelée les Lois de De Morgan :

Règle 1 : "NON (A ET B)" veut dire la même chose que "NON A, OU NON B"

Exemple : "Il n'est PAS vrai que j'ai un chat ET un chien."
C'est la même chose que : "Je n'ai pas de chat, OU je n'ai pas de chien."
(Au moins l'un des deux manque !)

Règle 2 : "NON (A OU B)" veut dire la même chose que "NON A, ET NON B"

Exemple : "Il n'est PAS vrai qu'il pleut OU qu'il neige."
C'est la même chose que : "Il ne pleut PAS ET il ne neige PAS."
(Ni l'un ni l'autre ne se produit !)

Réfléchis-y :
- Si quelqu'un dit "Il n'est pas vrai que j'aime LES DEUX, les épinards et le brocoli" — il dit qu'il n'aime pas au moins l'un des deux.
- Si quelqu'un dit "Il n'est pas vrai que j'aime les épinards OU le brocoli" — il dit qu'il n'aime ni l'un ni l'autre !`,
    questions: [
      { q: '"Il N\'est PAS vrai que la lumière est allumée ET le ventilateur est allumé." Qu\'est-ce que ça signifie ?', choices: ['Les deux sont éteints', 'Au moins l\'un des deux est éteint', 'Les deux sont allumés', 'Ni l\'un ni l\'autre n\'est allumé'], answer: 1 },
      { q: '"Je n\'ai PAS de chat OU de chien." Qu\'est-ce que ça signifie ?', choices: ['J\'en ai un mais pas l\'autre', 'J\'ai les deux', 'Je n\'ai pas de chat ET je n\'ai pas de chien', 'J\'en ai au moins un'], answer: 2 },
      { q: 'Deux propositions sont "équivalentes" quand elles :', choices: ['Se ressemblent', 'Sont toutes les deux courtes', 'Donnent toujours la même réponse vrai/faux', 'Parlent toutes les deux du même sujet'], answer: 2 },
      { q: '"NON (J\'ai un stylo ET un crayon)" signifie :', choices: ['Je n\'ai ni l\'un ni l\'autre', 'Il m\'en manque au moins un', 'J\'ai les deux', 'J\'ai un stylo mais pas de crayon'], answer: 1 },
      { q: '"NON (J\'aime les maths OU les sciences)" signifie :', choices: ['J\'en aime au moins une', 'Je n\'aime pas les maths ET je n\'aime pas les sciences', 'J\'aime les deux', 'Je n\'en aime qu\'une'], answer: 1 },
      { q: '"Il ne fait PAS froid ET il ne pleut PAS" est la même chose que :', choices: ['"Il ne fait PAS (froid OU pluvieux)"', '"Il fait froid ET il pleut"', '"Il ne fait PAS froid OU il ne pleut PAS"', '"Il fait froid OU il pleut"'], answer: 0 },
      { q: '"Je n\'ai pas de chat OU je n\'ai pas de chien." Cela signifie :', choices: ['Il me manque LES DEUX', 'Il m\'en manque au moins un', 'J\'ai les deux', 'Je n\'ai aucun animal'], answer: 1 },
      { q: '"NON (A ET B)" et "NON A ET NON B" sont-ils la même chose ?', choices: ['Oui, toujours', 'Non — le premier signifie qu\'il en manque au moins un, le second signifie qu\'il manque les deux', 'Oui, si A et B sont vrais', 'Parfois seulement'], answer: 1 },
      { q: '"Il n\'est PAS vrai que le film est long ET ennuyeux." Que sait-on ?', choices: ['Le film est court', 'Le film est amusant', 'Le film n\'est pas long OU n\'est pas ennuyeux (ou les deux)', 'Rien'], answer: 2 },
      { q: '"Je ne mangerai PAS de gâteau ET je ne mangerai PAS de tarte." Combien de desserts vais-je manger ?', choices: ['Deux', 'Un', 'Zéro', 'On ne peut pas savoir'], answer: 2 },
      { q: '"NON (la porte est ouverte OU la fenêtre est ouverte)" signifie :', choices: ['Au moins une est ouverte', 'Les deux sont fermées', 'Les deux sont ouvertes', 'L\'une est ouverte et l\'autre est fermée'], answer: 1 },
      { q: 'Quelle paire dit la MÊME chose ?', choices: ['"NON (A OU B)" et "NON A OU NON B"', '"NON (A ET B)" et "NON A OU NON B"', '"NON A" et "A"', '"A ET B" et "A OU B"'], answer: 1 },
      { q: '"Il n\'est pas vrai que j\'ai fini mes devoirs ET rangé ma chambre." Ma chambre est rangée. Et mes devoirs ?', choices: ['Les devoirs sont faits aussi', 'Les devoirs NE sont PAS faits', 'On ne peut rien savoir sur les devoirs', 'Les deux sont faits'], answer: 1 }
    ]
  },

  'valid-reasoning': {
    title: 'Bon raisonnement vs. Mauvais raisonnement',
    content: `Apprenons à distinguer un BON raisonnement d'un MAUVAIS raisonnement !

BON raisonnement (dit "valide") : Si les indices sont vrais, la réponse DOIT être vraie.

Voici un exemple de bon raisonnement :
  Indice 1 : "Si c'est un chien, alors c'est un animal."
  Indice 2 : "Buddy est un chien."
  Réponse : "Buddy est un animal."
C'est forcément juste ! Si tous les chiens sont des animaux et que Buddy est un chien, Buddy DOIT être un animal.

Voici maintenant un MAUVAIS raisonnement (une ERREUR à éviter !) :
  Indice 1 : "Si c'est un chien, alors c'est un animal."
  Indice 2 : "Moustache est un animal."
  Mauvaise réponse : "Moustache est un chien."
C'est FAUX ! Moustache pourrait être un chat, un poisson, ou n'importe quel animal ! Ce n'est pas parce que tous les chiens sont des animaux que tous les animaux sont des chiens !

Un autre bon exemple :
  Indice 1 : "Si c'est un chien, alors c'est un animal."
  Indice 2 : "Zorp N'est PAS un animal."
  Réponse : "Zorp N'est PAS un chien."
Ça marche ! Si tous les chiens sont des animaux et que Zorp N'est PAS un animal, alors Zorp NE PEUT PAS être un chien !`,
    questions: [
      { q: '"Tous les oiseaux peuvent voler. Tweety est un oiseau. Donc Tweety peut voler." Est-ce un bon raisonnement ?', choices: ['Non, c\'est un mauvais raisonnement', 'Oui, c\'est un bon raisonnement', 'On ne peut pas savoir', 'Seulement si Tweety est petit'], answer: 1 },
      { q: '"Tous les poissons vivent dans l\'eau. Nemo vit dans l\'eau. Donc Nemo est un poisson." Est-ce un bon raisonnement ?', choices: ['Oui, certainement !', 'Non — Nemo pourrait être autre chose qui vit dans l\'eau', 'Seulement si Nemo a des nageoires', 'Il nous faut plus d\'indices'], answer: 1 },
      { q: '"Si tu études, tu réussis le test. Tu n\'as PAS réussi. Donc tu n\'as PAS étudié." Est-ce un bon raisonnement ?', choices: ['Non, c\'est faux', 'Oui, c\'est un bon raisonnement', 'Parfois seulement', 'On ne peut pas savoir'], answer: 1 },
      { q: 'Qu\'est-ce qui rend un raisonnement "bon" (valide) ?', choices: ['La réponse semble correcte', 'Tu as beaucoup d\'indices', 'Si les indices sont vrais, la réponse DOIT être vraie', 'Tout le monde est d\'accord'], answer: 2 },
      { q: '"Tous les chats sont des animaux. Moustache est un chat. Donc Moustache est un animal." Est-ce valide ?', choices: ['Non', 'Oui', 'Peut-être', 'Seulement les jours de semaine'], answer: 1 },
      { q: '"Toutes les pommes sont des fruits. Ceci est un fruit. Donc c\'est une pomme." Est-ce un bon raisonnement ?', choices: ['Oui — fruit veut dire pomme', 'Non — ça pourrait être une orange ou une banane', 'Oui — les pommes sont courantes', 'Seulement si c\'est rouge'], answer: 1 },
      { q: '"Si tu t\'entraînes, tu t\'améliores. Sam s\'est amélioré. Donc Sam s\'est entraîné." Est-ce valide ?', choices: ['Oui — s\'améliorer veut dire s\'être entraîné', 'Non — Sam a peut-être progressé d\'une autre façon', 'Oui — l\'entraînement fonctionne toujours', 'Seulement pour le sport'], answer: 1 },
      { q: '"Tous les carrés sont des rectangles. Ceci n\'est pas un rectangle. Donc ce n\'est pas un carré." Est-ce valide ?', choices: ['Non — les carrés et les rectangles sont différents', 'Oui — si ce n\'est pas un rectangle, ce ne peut pas être un carré', 'Seulement pour les formes', 'Il faut mesurer'], answer: 1 },
      { q: '"Chaque fois que je lave ma voiture, il pleut. J\'ai lavé ma voiture aujourd\'hui. Donc il va pleuvoir." Quel est le problème ?', choices: ['Rien — il va pleuvoir', 'Laver une voiture ne CAUSE pas la pluie — c\'est une coïncidence', 'Les voitures ne font pas le temps', 'Ça dépend de la saison'], answer: 1 },
      { q: '"Aucun reptile n\'a de fourrure. Mon animal a de la fourrure. Donc mon animal n\'est pas un reptile." Est-ce valide ?', choices: ['Non — certains reptiles ont peut-être de la fourrure', 'Oui — si aucun reptile n\'a de fourrure et que mon animal en a, ce n\'est pas un reptile', 'Seulement si mon animal est un chien', 'Il faut voir l\'animal'], answer: 1 },
      { q: '"Les élèves qui étudient ont des A. Maria a eu un A." Peut-on conclure que Maria a étudié ?', choices: ['Oui — elle a eu un A donc elle a étudié', 'Non — peut-être qu\'elle connaissait déjà la matière', 'Oui — les A demandent d\'étudier', 'Seulement si le test était difficile'], answer: 1 },
      { q: '"Tous les chiens aboient. Rex n\'aboie pas. Donc Rex n\'est pas un chien." Ceci utilise :', choices: ['Un mauvais raisonnement', 'Un bon raisonnement — si tous les chiens aboient et que Rex n\'aboie pas, Rex ne peut pas être un chien', 'De la chance', 'Du bon sens seulement'], answer: 1 },
      { q: '"Si c\'est mardi, le magasin est fermé. Le magasin est ouvert." Que peut-on conclure ?', choices: ['C\'est mardi', 'Ce n\'est PAS mardi', 'Le magasin est cassé', 'Rien'], answer: 1 },
      { q: '"Tous mes amis aiment la musique. Jake aime la musique." Peut-on conclure que Jake est mon ami ?', choices: ['Oui — il aime la musique comme mes amis', 'Non — beaucoup de gens aiment la musique sans être mes amis', 'Oui — les amateurs de musique sont amis', 'Seulement si Jake est sympa'], answer: 1 },
      { q: 'Quelle est L\'ERREUR à éviter en logique ?', choices: ['Supposer que la conclusion prouve l\'indice', 'Lire les indices avec attention', 'Utiliser trop d\'indices', 'Demander de l\'aide'], answer: 0 }
    ]
  },

  'predicate-logic': {
    title: 'Au-delà du Vrai/Faux : Prédicats et Quantificateurs',
    content: `Jusqu'ici nous avons travaillé avec des propositions simples comme "il pleut." Mais la logique devient encore plus puissante quand on utilise des PRÉDICATS et des QUANTIFICATEURS !

Un PRÉDICAT est comme un test qu'on peut appliquer à des choses. "Est grand" est un prédicat — on peut le tester sur n'importe qui !
- Est grand(Girafe) = VRAI
- Est grand(Fourmi) = FAUX

Pense à un prédicat comme une question à compléter : "___ est grand" ou "___ peut voler" ou "___ est pair."

Maintenant, les QUANTIFICATEURS — ils nous permettent de parler de GROUPES de choses :

POUR TOUT (chaque) : "Pour tout chien, il a quatre pattes" signifie que CHAQUE chien a quatre pattes. Si même UN chien n'a pas quatre pattes, la proposition est FAUSSE !

IL EXISTE (au moins un) : "Il existe un fruit qui est jaune" signifie qu'AU MOINS UN fruit est jaune. Les bananes sont jaunes, donc c'est VRAI ! Il suffit de trouver UN exemple.

Voici la différence clé :
- "Pour tout X, X est lourd" = TOUT est lourd (difficile à être vrai !)
- "Il existe X, X est lourd" = QUELQUE CHOSE est lourd (beaucoup plus facile à être vrai !)

Pour RÉFUTER un énoncé "pour tout", tu as besoin d'UN SEUL contre-exemple !
"Tous les oiseaux peuvent voler." Les pingouins ne peuvent pas voler — donc c'est FAUX !

Pour PROUVER un énoncé "il existe", tu as besoin d'UN SEUL exemple !
"Il existe un animal qui vit dans l'eau." Les poissons ! Donc c'est VRAI !`,
    questions: [
      { q: 'Qu\'est-ce qu\'un prédicat en logique ?', choices: ['Un type d\'animal', 'Un test ou une propriété qu\'on peut appliquer à des choses', 'Un nombre qui est toujours vrai', 'Un type spécial de question'], answer: 1 },
      { q: '"Est rond" est un prédicat. Lequel de ces éléments le rend VRAI ?', choices: ['Est rond(Ballon de basket)', 'Est rond(Livre)', 'Est rond(Boîte)', 'Est rond(Pyramide)'], answer: 0 },
      { q: '"Pour tout oiseau, il a des plumes." Que signifie "pour tout" ici ?', choices: ['Certains oiseaux ont des plumes', 'Au moins un oiseau a des plumes', 'CHAQUE oiseau a des plumes', 'Aucun oiseau n\'a de plumes'], answer: 2 },
      { q: '"Il existe une planète qui a des anneaux." Qu\'est-ce que cela signifie ?', choices: ['Chaque planète a des anneaux', 'Aucune planète n\'a d\'anneaux', 'AU MOINS UNE planète a des anneaux', 'La plupart des planètes ont des anneaux'], answer: 2 },
      { q: 'Comment RÉFUTER un énoncé "pour tout" ?', choices: ['Montrer que tout correspond', 'Trouver UN SEUL élément qui ne correspond pas', 'Demander à un professeur', 'On ne peut pas le réfuter'], answer: 1 },
      { q: '"Pour tout animal, il peut nager." Un chat déteste l\'eau et ne peut pas nager. Qu\'est-ce que cela nous dit ?', choices: ['L\'énoncé est VRAI', 'L\'énoncé est FAUX — on a trouvé un contre-exemple', 'Les chats ne sont pas des animaux', 'Il nous faut plus de preuves'], answer: 1 },
      { q: '"Il existe un nombre plus grand que 100." Est-ce vrai ?', choices: ['FAUX — 100 est le plus grand nombre', 'VRAI — par exemple, 101', 'On ne peut pas savoir', 'Seulement en maths avancées'], answer: 1 },
      { q: 'Lequel est PLUS FACILE à rendre vrai ?', choices: ['"Pour tout X, X est bleu" (tout est bleu)', '"Il existe X, X est bleu" (quelque chose est bleu)', 'Ils sont aussi difficiles l\'un que l\'autre', 'Ni l\'un ni l\'autre ne peut être vrai'], answer: 1 },
      { q: '"Pour tout élève de la classe, il a réussi le test." Trois élèves ont échoué. Est-ce vrai ?', choices: ['VRAI — la plupart ont réussi', 'FAUX — pas TOUS les élèves ont réussi', 'VRAI — la majorité a réussi', 'Il nous faut les chiffres exacts'], answer: 1 },
      { q: '"Il existe un chien qui est amical." Buddy est un chien amical. L\'énoncé est-il prouvé ?', choices: ['Non — il faut que TOUS les chiens soient amicaux', 'Oui — il suffit d\'UN chien amical et Buddy compte', 'Non — un chien ne suffit pas', 'Seulement si Buddy est toujours amical'], answer: 1 },
      { q: 'Quelle proposition est l\'opposé de "Pour tout X, X est rouge" ?', choices: ['"Pour tout X, X est bleu"', '"Il existe X, X N\'est PAS rouge"', '"Rien n\'est rouge"', '"Il existe X, X est rouge"'], answer: 1 },
      { q: '"Pour tout poisson, il vit dans l\'eau." "Pour tout être qui vit dans l\'eau, c\'est un poisson." Sont-ils identiques ?', choices: ['Oui, ils disent la même chose', 'Non — les baleines vivent dans l\'eau mais ne sont pas des poissons', 'Oui — les animaux aquatiques sont des poissons', 'Seulement dans l\'océan'], answer: 1 },
      { q: '"Il existe une forme avec exactement 3 côtés." Quelle forme prouve que c\'est vrai ?', choices: ['Un carré', 'Un cercle', 'Un triangle', 'Un pentagone'], answer: 2 },
      { q: '"Pour tout légume, il est vert." Les carottes sont oranges. Que peut-on dire ?', choices: ['L\'énoncé est VRAI', 'Les carottes ne sont pas des légumes', 'L\'énoncé est FAUX — les carottes sont un contre-exemple', 'Il faut vérifier d\'autres légumes'], answer: 2 }
    ]
  },

  'logical-proofs': {
    title: 'Prouver les choses étape par étape',
    content: `En logique, une PREUVE consiste à montrer que quelque chose DOIT être vrai en suivant une chaîne d'étapes. C'est comme une chaîne de dominos — si faire tomber l'un fait toujours tomber le suivant, on peut prévoir exactement ce qui va se passer !

La technique de preuve la plus importante s'appelle le MODUS PONENS :
  Étape 1 : "Si P alors Q" (On connaît cette règle)
  Étape 2 : "P est vrai" (La condition s'est produite)
  Conclusion : "Q doit être vrai !" (Donc le résultat doit se produire)

Exemple :
  Règle : "Si c'est un jour d'école, je mets mon uniforme."
  Fait : "Aujourd'hui c'est un jour d'école."
  Donc : "Je mets mon uniforme aujourd'hui."

Une autre technique puissante est le MODUS TOLLENS (raisonner à l'envers !) :
  Étape 1 : "Si P alors Q" (On connaît cette règle)
  Étape 2 : "Q N'est PAS vrai" (Le résultat ne s'est PAS produit)
  Conclusion : "P ne doit PAS être vrai !" (Donc la condition ne s'est pas produite non plus)

Exemple :
  Règle : "S'il pleut, le sol est mouillé."
  Fait : "Le sol N'est PAS mouillé."
  Donc : "Il ne pleut PAS."

On peut aussi construire des CHAÎNES (appelées syllogismes) :
  "Si A alors B" et "Si B alors C" donnent ensemble "Si A alors C" !

Exemple :
  "Si c'est un caniche, alors c'est un chien."
  "Si c'est un chien, alors c'est un animal."
  Donc : "Si c'est un caniche, alors c'est un animal."

Comme relier des maillons — la conclusion d'une règle alimente la suivante !`,
    questions: [
      { q: 'Qu\'est-ce que le Modus Ponens ?', choices: ['Si P alors Q, et Q est vrai, donc P est vrai', 'Si P alors Q, et P est vrai, donc Q est vrai', 'Si P alors Q, et Q est faux, donc P est faux', 'Si P alors Q, et P est faux, donc Q est faux'], answer: 1 },
      { q: 'Règle : "Si tu appuies sur le bouton, la cloche sonne." Tu appuies sur le bouton. Que se passe-t-il ?', choices: ['Rien', 'La cloche sonne', 'Le bouton se casse', 'On ne peut pas savoir'], answer: 1 },
      { q: 'Règle : "Si c\'est un chat, il a des moustaches." Félix N\'a PAS de moustaches. Que peut-on conclure ?', choices: ['Félix est un chat', 'Félix N\'est PAS un chat', 'Félix est un chien', 'On ne peut pas savoir'], answer: 1 },
      { q: 'Quelle technique nous permet de raisonner À L\'ENVERS à partir d\'un résultat qui ne s\'est pas produit ?', choices: ['Modus Ponens', 'Modus Tollens', 'Une supposition', 'Logique aléatoire'], answer: 1 },
      { q: '"Si A alors B" et "Si B alors C." Que peut-on conclure ?', choices: ['"Si C alors A"', '"Si A alors C"', '"Si B alors A"', 'Rien de nouveau'], answer: 1 },
      { q: '"S\'il pleut, j\'apporte un parapluie. Si j\'apporte un parapluie, je reste sec." Il pleut. Que se passe-t-il ?', choices: ['Je me mouille', 'Je reste sec', 'J\'oublie mon parapluie', 'On ne peut pas savoir'], answer: 1 },
      { q: '"Si tu manges des bonbons, tes dents font mal. Si tes dents font mal, tu vas chez le dentiste." Tu as mangé des bonbons. Que se passe-t-il ?', choices: ['Rien', 'Tes dents vont bien', 'Tu vas chez le dentiste', 'Tu manges encore des bonbons'], answer: 2 },
      { q: '"Si c\'est une rose, c\'est une fleur. Si c\'est une fleur, c\'est une plante." Marguerite N\'est PAS une plante. Que sait-on ?', choices: ['Marguerite est une rose', 'Marguerite est une fleur', 'Marguerite N\'est PAS une rose ET N\'est PAS une fleur', 'On ne peut pas savoir'], answer: 2 },
      { q: 'Règle : "Si l\'alarme se déclenche, tout le monde quitte le bâtiment." Personne n\'est parti. Que peut-on conclure ?', choices: ['L\'alarme s\'est déclenchée mais personne n\'a entendu', 'L\'alarme NE s\'est PAS déclenchée', 'Tout le monde est sourd', 'Le bâtiment est vide'], answer: 1 },
      { q: '"Si j\'étudie, je réussis. J\'ai réussi." Peut-on conclure que j\'ai étudié ?', choices: ['Oui — le Modus Ponens le dit', 'Non — j\'aurais pu réussir autrement. Ce serait un mauvais raisonnement !', 'Oui — réussir prouve qu\'on a étudié', 'Seulement si le test était difficile'], answer: 1 },
      { q: '"Si A alors B. Si B alors C. Si C alors D." A est vrai. Que sait-on de D ?', choices: ['D est faux', 'D est vrai', 'D est peut-être vrai', 'On ne peut pas savoir'], answer: 1 },
      { q: '"Si tu es un manchot, tu es un oiseau. Tweety est un oiseau." Peut-on dire que Tweety est un manchot ?', choices: ['Oui, tous les oiseaux sont des manchots', 'Non — Tweety pourrait être n\'importe quel oiseau', 'Oui, par le Modus Ponens', 'Seulement si Tweety ne peut pas voler'], answer: 1 },
      { q: 'Une preuve en logique ressemble à :', choices: ['Une supposition qui pourrait être juste', 'Une chaîne d\'étapes où chaque étape DOIT découler de la précédente', 'Une opinion avec laquelle tout le monde est d\'accord', 'Un problème de maths très difficile'], answer: 1 },
      { q: '"Si la batterie est morte, le téléphone ne s\'allume pas. Le téléphone s\'est allumé." Que sait-on ?', choices: ['La batterie est morte', 'La batterie N\'est PAS morte', 'Le téléphone est cassé', 'Il faut le charger'], answer: 1 },
      { q: '"Si X alors Y. Si Y alors Z." Z est faux. Que peut-on dire de X ?', choices: ['X est vrai', 'X est faux', 'X pourrait être l\'un ou l\'autre', 'Il nous faut plus d\'informations'], answer: 1 }
    ]
  },

  'set-theory': {
    title: 'Collections et Groupes : La Théorie des Ensembles',
    content: `Un ENSEMBLE est simplement une collection ou un groupe de choses. On peut faire un ensemble avec n'importe quoi !

Exemples d'ensembles :
- L'ensemble de tous les fruits : {pomme, banane, orange, raisin, ...}
- L'ensemble des nombres pairs : {2, 4, 6, 8, 10, ...}
- L'ensemble des couleurs de l'arc-en-ciel : {rouge, orange, jaune, vert, bleu, indigo, violet}

L'APPARTENANCE signifie si quelque chose est DANS un ensemble ou non :
- La pomme FAIT partie de l'ensemble des fruits (on dit que la pomme est un "membre")
- La voiture NE fait PAS partie de l'ensemble des fruits

L'UNION signifie COMBINER deux ensembles (tout ce qui est dans l'un ou l'autre) :
- Ensemble A = {chat, chien}  Ensemble B = {poisson, chien}
- Union de A et B = {chat, chien, poisson}  (On met tout ensemble ! Pas de répétitions !)
- Pense à mettre le contenu de deux boîtes à jouets ensemble.

L'INTERSECTION signifie le RECOUVREMENT (seulement les choses dans LES DEUX ensembles) :
- Ensemble A = {chat, chien}  Ensemble B = {poisson, chien}
- Intersection de A et B = {chien}  (Seul le chien est dans les deux !)
- Pense à la partie centrale d'un diagramme de Venn !

LE SOUS-ENSEMBLE signifie qu'un ensemble tient ENTIÈREMENT dans un autre :
- {chat, chien} est un sous-ensemble de {chat, chien, poisson, oiseau}
- Chaque élément du premier ensemble est aussi dans le deuxième
- Pense à une petite boîte à l'intérieur d'une plus grande !

L'ENSEMBLE VIDE {} est un ensemble qui ne contient RIEN. Il est un sous-ensemble de tout ensemble !`,
    questions: [
      { q: 'Qu\'est-ce qu\'un ensemble ?', choices: ['Un type de problème de maths', 'Une collection ou un groupe de choses', 'Un nombre qui est toujours vrai', 'Un type spécial de proposition'], answer: 1 },
      { q: 'Ensemble A = {pomme, banane, cerise}. "Banane" est-elle un membre de l\'Ensemble A ?', choices: ['Non', 'Oui', 'Parfois seulement', 'On ne peut pas savoir'], answer: 1 },
      { q: 'Ensemble A = {1, 2, 3} et Ensemble B = {3, 4, 5}. Quelle est l\'UNION de A et B ?', choices: ['{3}', '{1, 2, 3, 4, 5}', '{1, 2, 4, 5}', '{3, 3}'], answer: 1 },
      { q: 'Ensemble A = {1, 2, 3} et Ensemble B = {3, 4, 5}. Quelle est l\'INTERSECTION de A et B ?', choices: ['{1, 2, 3, 4, 5}', '{1, 2, 4, 5}', '{3}', '{}'], answer: 2 },
      { q: '{chat, chien} est-il un sous-ensemble de {chat, chien, poisson} ?', choices: ['Non — ce sont des ensembles différents', 'Oui — chaque élément du premier est dans le second', 'Seulement si on ajoute le poisson', 'On ne peut pas savoir'], answer: 1 },
      { q: 'Ensemble A = {rouge, bleu} et Ensemble B = {vert, jaune}. Quelle est leur intersection ?', choices: ['{rouge, bleu, vert, jaune}', '{rouge, vert}', '{}  (l\'ensemble vide — rien en commun !)', '{bleu, jaune}'], answer: 2 },
      { q: 'L\'ensemble vide {} contient combien d\'éléments ?', choices: ['Un', 'Deux', 'Zéro', 'L\'infini'], answer: 2 },
      { q: 'Dans un diagramme de Venn, la partie centrale qui se chevauche représente :', choices: ['L\'union', 'L\'intersection', 'L\'ensemble vide', 'Tout ce qui est en dehors des deux ensembles'], answer: 1 },
      { q: 'Ensemble A = {pomme, banane}. Ensemble B = {banane, cerise}. Ensemble C = {cerise, datte}. Qu\'y a-t-il dans l\'intersection de A et B ?', choices: ['{pomme}', '{cerise}', '{banane}', '{pomme, banane, cerise}'], answer: 2 },
      { q: '{1, 2, 3} est-il un sous-ensemble de {1, 2, 3} ?', choices: ['Non — ce sont le même ensemble, pas un sous-ensemble', 'Oui — chaque élément du premier est dans le second', 'Seulement si on ajoute d\'autres nombres', 'Ce n\'est pas permis'], answer: 1 },
      { q: 'Ensemble A = {chien, chat, oiseau}. Ensemble B = {chien, poisson, chat, oiseau, serpent}. Quelle est la relation de A avec B ?', choices: ['A est un sur-ensemble de B', 'A est un sous-ensemble de B', 'A et B sont complètement différents', 'A est l\'intersection de B'], answer: 1 },
      { q: 'Si Ensemble X = {a, b, c} et Ensemble Y = {a, b, c, d, e}, quelle est leur intersection ?', choices: ['{d, e}', '{a, b, c, d, e}', '{a, b, c}', '{}'], answer: 2 },
      { q: 'L\'union de N\'IMPORTE QUEL ensemble avec l\'ensemble vide {} te donne :', choices: ['L\'ensemble vide', 'L\'ensemble original inchangé', 'Un ensemble plus grand', 'Une erreur'], answer: 1 },
      { q: 'Ensemble A = {1, 2, 3, 4, 5} et Ensemble B = {2, 4, 6, 8}. Combien d\'éléments y a-t-il dans leur intersection ?', choices: ['0', '2  (les nombres 2 et 4)', '5', '9'], answer: 1 }
    ]
  },

  'boolean-algebra': {
    title: 'Les maths avec VRAI et FAUX',
    content: `Tout comme les maths ordinaires ont des raccourcis et des règles (5 x 1 = 5, ou 0 + 7 = 7), la logique a aussi des raccourcis ! Ces règles s'appellent l'ALGÈBRE BOOLÉENNE et elles nous aident à simplifier des expressions logiques compliquées.

Voici les règles les plus utiles :

RÈGLES D'IDENTITÉ (les choses qui ne changent rien) :
- A ET VRAI = A  (ET avec VRAI ne change rien !)
- A OU FAUX = A  (OU avec FAUX ne change rien !)

RÈGLES DE DOMINATION (les choses qui l'emportent) :
- A ET FAUX = FAUX  (ET avec FAUX donne toujours FAUX !)
- A OU VRAI = VRAI  (OU avec VRAI gagne toujours !)

DOUBLE NÉGATION (deux négatifs s'annulent) :
- NON NON A = A  (inverser deux fois ramène au départ !)

RÈGLES D'IDEMPOTENCE (répéter ne change rien) :
- A ET A = A  (le dire deux fois ne change rien !)
- A OU A = A  (pareil ici !)

RÈGLES DE COMPLÉMENT (les contraires) :
- A ET NON A = FAUX  (quelque chose ne peut pas être vrai ET faux !)
- A OU NON A = VRAI  (quelque chose est TOUJOURS soit vrai soit faux !)

ABSORPTION (une partie avale l'autre) :
- A OU (A ET B) = A  (si A est vrai, le reste n'a pas d'importance !)
- A ET (A OU B) = A  (si A est faux, tout est faux !)

Ces règles nous permettent de transformer une logique longue et compliquée en quelque chose de court et clair !`,
    questions: [
      { q: 'À quoi se simplifie "A ET VRAI" ?', choices: ['VRAI', 'FAUX', 'A', 'NON A'], answer: 2 },
      { q: 'À quoi se simplifie "A OU FAUX" ?', choices: ['FAUX', 'A', 'VRAI', 'NON A'], answer: 1 },
      { q: 'À quoi se simplifie "A ET FAUX" ?', choices: ['A', 'VRAI', 'FAUX', 'NON A'], answer: 2 },
      { q: 'À quoi se simplifie "A OU VRAI" ?', choices: ['A', 'VRAI', 'FAUX', 'NON A'], answer: 1 },
      { q: 'À quoi se simplifie "NON NON A" ?', choices: ['NON A', 'FAUX', 'VRAI', 'A'], answer: 3 },
      { q: 'À quoi se simplifie "A ET A" ?', choices: ['A ET A', 'VRAI', 'A', 'FAUX'], answer: 2 },
      { q: 'À quoi se simplifie "A ET NON A" ?', choices: ['A', 'VRAI', 'NON A', 'FAUX'], answer: 3 },
      { q: 'À quoi se simplifie "A OU NON A" ?', choices: ['A', 'NON A', 'FAUX', 'VRAI'], answer: 3 },
      { q: '"Il pleut ET VRAI." À quoi cela se simplifie-t-il ?', choices: ['VRAI', '"Il pleut"', 'FAUX', '"Il ne pleut pas"'], answer: 1 },
      { q: '"A OU (A ET B)" se simplifie en quoi ? (Règle d\'absorption)', choices: ['B', 'A ET B', 'A', 'A OU B'], answer: 2 },
      { q: '"A ET (A OU B)" se simplifie en quoi ? (Règle d\'absorption)', choices: ['A OU B', 'B', 'A ET B', 'A'], answer: 3 },
      { q: 'Quelle règle dit "inverser quelque chose deux fois ramène au point de départ" ?', choices: ['Identité', 'Double Négation', 'Domination', 'Complément'], answer: 1 },
      { q: '"(P ET VRAI) OU FAUX" se simplifie en :', choices: ['VRAI', 'FAUX', 'P', 'NON P'], answer: 2 },
      { q: '"X OU X OU X" se simplifie en :', choices: ['3X', 'VRAI', 'X', 'FAUX'], answer: 2 },
      { q: 'Pourquoi l\'algèbre booléenne est-elle utile ?', choices: ['Elle rend la logique plus compliquée', 'Elle nous permet de simplifier une logique complexe en expressions plus courtes', 'Elle fonctionne seulement sur les ordinateurs', 'Elle remplace les maths ordinaires'], answer: 1 }
    ]
  },

  'modal-logic': {
    title: 'Possibilité et Nécessité',
    content: `Jusqu'ici, tout était VRAI ou FAUX. Mais que dire des choses qui POURRAIENT être vraies, ou qui DOIVENT être vraies ? Bienvenue dans la LOGIQUE MODALE !

NÉCESSAIRE signifie que quelque chose DOIT être vrai — il n'y a aucun moyen que ce soit faux :
- "2 + 2 = 4" est NÉCESSAIREMENT vrai. C'est toujours 4, quoi qu'il arrive !
- "Un carré a 4 côtés" est NÉCESSAIREMENT vrai. C'est ce qui en fait un carré !

POSSIBLE signifie que quelque chose POURRAIT être vrai — ce n'est pas garanti, mais ce n'est pas impossible non plus :
- "Il pleuvra peut-être demain" est POSSIBLE. Ça pourrait arriver ou non.
- "Tu pourrais lancer un 6 avec un dé" est POSSIBLE. Ce n'est pas garanti, mais ça peut arriver.

IMPOSSIBLE signifie que quelque chose NE PEUT PAS être vrai — il n'y a aucune façon que ça arrive :
- "2 + 2 = 7" est IMPOSSIBLE. Ce ne sera jamais vrai !
- "Un cercle a des coins" est IMPOSSIBLE. Les cercles sont ronds !

Voici comment ils sont liés :
- Si quelque chose est NÉCESSAIRE, c'est aussi POSSIBLE (si ça doit arriver, ça peut certainement arriver !)
- Si quelque chose est IMPOSSIBLE, ce n'est PAS possible.
- NON NÉCESSAIRE ne veut pas dire IMPOSSIBLE ! "Il pleuvra demain" n'est pas nécessaire, mais ce n'est pas impossible non plus.

Pense-y ainsi :
- NÉCESSAIRE = garanti de se produire, sans exception
- POSSIBLE = pourrait se produire, non exclu
- IMPOSSIBLE = ne peut jamais se produire, totalement exclu
- CONTINGENT = pourrait aller dans un sens ou dans l'autre (possible mais pas nécessaire)`,
    questions: [
      { q: '"2 + 2 = 4." Est-ce nécessaire, possible ou impossible ?', choices: ['Possible mais pas nécessaire', 'Nécessaire — c\'est FORCÉMENT vrai', 'Impossible', 'Contingent'], answer: 1 },
      { q: '"Il neigera en juillet à Hawaii." C\'est :', choices: ['Nécessaire', 'Impossible — il ne peut pas neiger à Hawaii sous les tropiques', 'Possible mais très peu probable', 'Contingent'], answer: 2 },
      { q: '"Un triangle a 5 côtés." C\'est :', choices: ['Nécessaire', 'Possible', 'Impossible — un triangle a toujours 3 côtés', 'Contingent'], answer: 2 },
      { q: 'Si quelque chose est NÉCESSAIRE, est-ce aussi POSSIBLE ?', choices: ['Non — nécessaire et possible sont des contraires', 'Oui — si ça doit se produire, ça peut certainement se produire', 'Parfois seulement', 'Seulement en maths'], answer: 1 },
      { q: '"J\'aurai peut-être un chiot pour mon anniversaire." C\'est :', choices: ['Nécessaire', 'Impossible', 'Possible mais pas nécessaire', 'Nécessairement faux'], answer: 2 },
      { q: '"Tous les célibataires sont non mariés." C\'est :', choices: ['Possible mais pas nécessaire', 'Nécessaire — c\'est vrai par définition', 'Impossible', 'Contingent'], answer: 1 },
      { q: 'Que signifie CONTINGENT ?', choices: ['C\'est forcément vrai', 'C\'est impossible', 'C\'est vrai ou faux — ça peut aller dans un sens ou dans l\'autre', 'C\'est toujours faux'], answer: 2 },
      { q: '"Un nombre est pair ET impair en même temps." C\'est :', choices: ['Nécessaire', 'Possible', 'Impossible — un nombre ne peut pas être les deux', 'Contingent'], answer: 2 },
      { q: '"Le prochain lancer de pièce sera face." C\'est :', choices: ['Nécessaire', 'Impossible', 'Possible mais pas nécessaire', 'Nécessairement vrai'], answer: 2 },
      { q: 'Quelque chose n\'est PAS nécessaire. Est-ce que ça signifie que c\'est impossible ?', choices: ['Oui — si ce n\'est pas nécessaire ça ne peut pas arriver', 'Non — ça pourrait être possible, juste pas garanti', 'Oui — pas nécessaire veut dire faux', 'Seulement en logique'], answer: 1 },
      { q: '"Si quelque chose est impossible, ce n\'est pas possible." Est-ce correct ?', choices: ['Non — les choses impossibles peuvent quand même arriver', 'Oui — impossible signifie que ça ne peut pas arriver, donc ce n\'est pas possible', 'Parfois seulement', 'Ça dépend de la situation'], answer: 1 },
      { q: '"L\'eau bout à 100 degrés Celsius au niveau de la mer." C\'est :', choices: ['Impossible', 'Contingent', 'Nécessaire — c\'est une loi de la nature dans ces conditions', 'Possible mais peu probable'], answer: 2 },
      { q: 'Quelle proposition est NÉCESSAIREMENT vraie ?', choices: ['"Il fait beau aujourd\'hui"', '"Tous les cercles sont ronds"', '"Ma couleur préférée est le bleu"', '"Demain c\'est vendredi"'], answer: 1 },
      { q: '"Il y a un chat sur Mars en ce moment." C\'est :', choices: ['Nécessaire', 'Impossible en principe', 'Possible mais extrêmement peu probable', 'Nécessairement vrai'], answer: 2 }
    ]
  },

  'paradoxes': {
    title: 'Les puzzles qui font tourner la tête : les Paradoxes',
    content: `Que se passe-t-il quand une proposition parle d'ELLE-MÊME ? Parfois des choses vraiment étranges arrivent ! On appelle ça des PARADOXES.

LE PARADOXE DU MENTEUR :
"Cette phrase est fausse."
Réfléchis-y : Si la phrase est VRAIE, alors ce qu'elle dit doit être correct... mais elle dit qu'elle est fausse. Donc elle est fausse ?
Mais si elle est FAUSSE, alors "cette phrase est fausse" est inexact, ce qui signifie que la phrase est en fait vraie !
Elle oscille indéfiniment ! VRAI mène à FAUX, qui mène à VRAI, qui mène à FAUX...

LE PARADOXE DU BARBIER :
Dans une ville, un barbier rase tous ceux qui ne se rasent pas eux-mêmes, et SEULEMENT ces personnes.
Question : Qui rase le barbier ?
- Si le barbier se rase lui-même, alors il SE rase, donc le barbier ne devrait PAS le raser (le barbier ne rase que ceux qui ne se rasent pas eux-mêmes).
- Si le barbier NE se rase PAS lui-même, alors il est quelqu'un qui ne se rase pas lui-même, donc le barbier DEVRAIT le raser !
Il n'y a pas de bonne réponse !

POURQUOI LES PARADOXES SONT-ILS IMPORTANTS ?
Les paradoxes ne sont pas que des puzzles amusants — ils ont aidé les mathématiciens à découvrir des choses importantes :
- Certaines propositions ne peuvent pas être simplement vraies ou fausses
- L'autoréférence (quand quelque chose se réfère à lui-même) peut causer des problèmes
- Nous avons besoin de règles précises pour éviter les contradictions

LE PARADOXE DE PINOCCHIO :
"Mon nez va pousser MAINTENANT." Si Pinocchio dit ça, que se passe-t-il ? Son nez pousse seulement quand il ment !

Les paradoxes nous apprennent à réfléchir soigneusement aux RÈGLES de la logique elle-même !`,
    questions: [
      { q: 'Qu\'est-ce qu\'un paradoxe ?', choices: ['Une proposition qui est toujours vraie', 'Une proposition qui est toujours fausse', 'Une proposition qui mène à une contradiction ou à une situation impossible', 'Un type d\'équation mathématique'], answer: 2 },
      { q: '"Cette phrase est fausse." Si on suppose qu\'elle est VRAIE, que se passe-t-il ?', choices: ['Elle reste vraie', 'Elle doit être fausse (parce qu\'elle dit qu\'elle est fausse)', 'Rien ne se passe', 'Elle devient une question'], answer: 1 },
      { q: '"Cette phrase est fausse." Si on suppose qu\'elle est FAUSSE, que se passe-t-il ?', choices: ['Elle reste fausse', 'Elle doit être vraie (parce que dire qu\'elle est fausse serait inexact)', 'Rien ne se passe', 'Elle disparaît'], answer: 1 },
      { q: 'Dans le Paradoxe du Barbier, qui rase le barbier ?', choices: ['Le barbier se rase lui-même', 'Quelqu\'un d\'autre le rase', 'Il n\'y a pas de réponse cohérente — c\'est le paradoxe !', 'Il n\'a pas besoin de se raser'], answer: 2 },
      { q: 'Quelle est la cause de la plupart des paradoxes ?', choices: ['De mauvaises maths', 'L\'autoréférence — quand quelque chose se réfère à lui-même', 'Poser trop de questions', 'Utiliser de grands nombres'], answer: 1 },
      { q: '"La phrase suivante est vraie. La phrase précédente est fausse." C\'est :', choices: ['Toutes les deux vraies', 'Toutes les deux fausses', 'Un paradoxe — elles se contredisent', 'Juste confus mais pas un paradoxe'], answer: 2 },
      { q: 'Si Pinocchio dit "Mon nez va pousser maintenant", que se passe-t-il ?', choices: ['Son nez pousse parce qu\'il ment toujours', 'Son nez ne pousse pas parce qu\'il dit la vérité', 'C\'est un paradoxe — aucune réponse ne fonctionne', 'Son nez tombe'], answer: 2 },
      { q: 'Pourquoi les paradoxes sont-ils importants en logique ?', choices: ['Ce sont juste des jeux amusants', 'Ils nous montrent où les règles de la logique doivent être plus précises', 'Ils prouvent que la logique ne fonctionne pas', 'Ils ne sont pas du tout importants'], answer: 1 },
      { q: '"Je mens toujours." Est-ce un paradoxe ?', choices: ['Non — la personne est juste malhonnête', 'Oui — si elle ment toujours, cette affirmation est un mensonge, ce qui signifie qu\'elle ne ment pas toujours', 'Non — certaines personnes mentent toujours', 'Seulement si c\'est Pinocchio'], answer: 1 },
      { q: 'Lequel de ces éléments est un paradoxe ?', choices: ['"Le ciel est bleu"', '"2 + 2 = 5"', '"Cette phrase contient cinq mots"', '"L\'ensemble de tous les ensembles qui ne se contiennent pas eux-mêmes"'], answer: 3 },
      { q: 'Le Paradoxe du Barbier est lié à quel célèbre paradoxe en mathématiques ?', choices: ['Le Paradoxe de Pinocchio', 'Le Paradoxe de Russell sur les ensembles', 'Le Paradoxe des anniversaires', 'Le Paradoxe de Fermi'], answer: 1 },
      { q: '"Tout ce que je dis est faux." Si cette affirmation est juste, alors :', choices: ['Tout ce qu\'ils disent d\'autre est aussi juste', 'L\'affirmation elle-même doit être fausse, créant une contradiction', 'C\'est une bonne personne', 'On devrait les croire'], answer: 1 },
      { q: 'Un panneau dit "IGNOREZ CE PANNEAU." Qu\'y a-t-il de paradoxal ?', choices: ['Les panneaux ne peuvent pas parler', 'Pour suivre l\'instruction il faut le lire, mais il dit de l\'ignorer', 'Rien n\'est paradoxal', 'Le panneau est trop petit'], answer: 1 },
      { q: 'Comment les mathématiciens ont-ils répondu aux paradoxes comme le Paradoxe de Russell ?', choices: ['Ils ont abandonné les maths', 'Ils ont créé des règles plus précises pour éviter les contradictions', 'Ils ont décidé que les paradoxes ne sont pas réels', 'Ils ont complètement interdit l\'autoréférence'], answer: 1 }
    ]
  },

  'analyzing-arguments': {
    title: 'Les Fondations : Prémisses et Conclusions',
    content: `Chaque argument a deux parties : les PRÉMISSES (les raisons) et une CONCLUSION (ce qu'on essaie de prouver).

Pense à des blocs de construction :
- Les PRÉMISSES sont les blocs du bas — ils soutiennent tout
- La CONCLUSION est le bloc du dessus — c'est ce que les prémisses portent

Exemple :
  Prémisse : Tous les chiens sont des animaux.
  Prémisse : Rex est un chien.
  Conclusion : Donc, Rex est un animal.

Comment les repérer :
- MOTS DE CONCLUSION : donc, ainsi, par conséquent, il s'ensuit que
- MOTS DE PRÉMISSE : parce que, puisque, car, étant donné que, vu que

Tout ce qui contient des phrases n'est pas un argument ! Un rapport, une description ou une liste de faits N'est PAS un argument à moins qu'une affirmation soit soutenue par d'autres.

"Il pleut et je suis mouillé" = juste deux faits (PAS un argument)
"Il pleut, DONC je suis mouillé" = un argument ! (la pluie soutient le fait d'être mouillé)`,
    questions: [
      { q: 'Dans un argument, la CONCLUSION est :', choices: ['La raison donnée', 'Ce qu\'on essaie de prouver', 'Une question', 'Un sentiment'], answer: 1 },
      { q: 'Dans un argument, les PRÉMISSES sont :', choices: ['La réponse finale', 'Les raisons qui soutiennent la conclusion', 'Des questions sur le sujet', 'Des opinions seulement'], answer: 1 },
      { q: '"Tous les chats sont des animaux. Moustache est un chat. Donc Moustache est un animal." Quelle est la conclusion ?', choices: ['Tous les chats sont des animaux', 'Moustache est un chat', 'Moustache est un animal', 'Les chats et les animaux sont la même chose'], answer: 2 },
      { q: 'Quel mot annonce une CONCLUSION ?', choices: ['Parce que', 'Puisque', 'Donc', 'Étant donné que'], answer: 2 },
      { q: 'Quel mot annonce une PRÉMISSE ?', choices: ['Donc', 'Ainsi', 'Par conséquent', 'Parce que'], answer: 3 },
      { q: '"Je suis fatigué parce que je me suis couché tard." Quelle est la prémisse ?', choices: ['Je suis fatigué', 'Je me suis couché tard', 'Les deux', 'Ni l\'une ni l\'autre'], answer: 1 },
      { q: '"Il fait soleil aujourd\'hui. J\'aime la pizza." Est-ce un argument ?', choices: ['Oui — deux propositions', 'Non — l\'une ne soutient pas l\'autre', 'Oui — les deux sont vraies', 'Seulement les jours de soleil'], answer: 1 },
      { q: '"Puisque tous les oiseaux ont des plumes, et que les manchots sont des oiseaux, les manchots ont des plumes." Combien de prémisses y a-t-il ?', choices: ['Une', 'Deux', 'Trois', 'Zéro'], answer: 1 },
      { q: 'Un article de presse qui liste des faits sans tirer de conclusion est :', choices: ['Un argument solide', 'Pas un argument', 'Un argument faible', 'Un argument caché'], answer: 1 },
      { q: '"Tu devrais mettre un manteau, car il fait très froid dehors." La conclusion est :', choices: ['Il fait très froid dehors', 'Tu devrais mettre un manteau', 'Les manteaux sont chauds', 'C\'est l\'hiver'], answer: 1 },
      { q: 'Un argument doit avoir :', choices: ['Au moins une prémisse et une conclusion', 'Exactement deux prémisses', 'Seulement des faits', 'Une question et une réponse'], answer: 0 },
      { q: '"Les chiens sont loyaux. Les chiens sont amicaux. Les chiens font de bons animaux de compagnie." La conclusion est probablement :', choices: ['Les chiens sont loyaux', 'Les chiens sont amicaux', 'Les chiens font de bons animaux de compagnie', 'Les trois sont des conclusions'], answer: 2 },
      { q: '"Ainsi, l\'expérience prouve la théorie." Le mot "ainsi" nous indique que c\'est :', choices: ['Une prémisse', 'Une conclusion', 'Une question', 'Une définition'], answer: 1 },
      { q: 'Une seule phrase peut-elle être un argument ?', choices: ['Jamais', 'Oui, si elle contient une prémisse et une conclusion reliées par un mot comme "parce que"', 'Seulement si elle est très longue', 'Seulement à l\'écrit'], answer: 1 }
    ]
  },

  'language-ambiguity': {
    title: 'Les mots trompeurs : Langage et Ambiguïté',
    content: `Les mots peuvent être TROMPEURS ! Parfois les mêmes mots peuvent vouloir dire des choses complètement différentes. Cela crée de la confusion en logique.

L'AMBIGUÏTÉ signifie qu'un mot ou une phrase a PLUS D'UN sens :
- "J'ai vu l'homme avec le télescope" — Qui a le télescope ? Toi ou l'homme ?
- "Les avions qui volent peuvent être dangereux" — Est-ce dangereux de les piloter, ou les avions eux-mêmes sont-ils dangereux ?

La VAGUEUR signifie qu'un mot n'est pas assez précis :
- "Elle est grande" — Combien grande ? Grande pour un enfant de 5 ans ou pour un joueur de basket ?
- "C'est beaucoup d'argent" — 100 € ? 1 000 € ? 1 000 000 € ?

L'ÉQUIVOQUE consiste à utiliser le même mot avec DEUX sens différents dans un argument :
- "Une banque est au bord d'une rivière. Je mets mon argent à la banque. Donc je mets mon argent au bord d'une rivière." FAUX ! Deux sens différents de "banque" !

Les DÉFINITIONS nous aident à être précis :
- Une bonne définition dit EXACTEMENT ce que veut dire un mot
- Elle ne doit être ni trop large (inclut trop) ni trop étroite (exclut des choses)
- "Un chien est un animal" est trop LARGE — les chats sont aussi des animaux !
- "Un chien est un labrador" est trop ÉTROIT — qu'en est-il des caniches ?`,
    questions: [
      { q: '"J\'ai vu l\'homme avec le télescope." Cette phrase est :', choices: ['Claire et précise', 'Ambiguë — elle a deux sens', 'Vague', 'Une définition'], answer: 1 },
      { q: 'Qu\'est-ce que l\'AMBIGUÏTÉ ?', choices: ['Quand un mot est trop précis', 'Quand un mot a plus d\'un sens', 'Quand un mot est inconnu', 'Quand une phrase est longue'], answer: 1 },
      { q: 'Qu\'est-ce que la VAGUEUR ?', choices: ['Avoir deux sens', 'Être trop précis', 'Ne pas être assez précis', 'Utiliser de grands mots'], answer: 2 },
      { q: '"Elle est jeune." C\'est un exemple de :', choices: ['Ambiguïté', 'Vagueur — combien jeune ?', 'Une définition', 'Un argument'], answer: 1 },
      { q: '"Un avion est quelque chose qui vole. Un menuisier utilise un rabot. Donc un menuisier utilise quelque chose qui vole." Cette erreur s\'appelle :', choices: ['Ambiguïté', 'Vagueur', 'Équivoque', 'Un paradoxe'], answer: 2 },
      { q: '"Un chien est un labrador." Cette définition est :', choices: ['Trop large', 'Trop étroite — elle exclut les autres races de chiens', 'Parfaite', 'Ambiguë'], answer: 1 },
      { q: '"Un chien est un être vivant." Cette définition est :', choices: ['Trop large — les chats et les arbres sont aussi des êtres vivants', 'Trop étroite', 'Parfaite', 'Vague'], answer: 0 },
      { q: '"Rien n\'est meilleur que la pizza. Un sandwich est meilleur que rien. Donc un sandwich est meilleur que la pizza." Qu\'est-ce qui ne va pas ?', choices: ['Le raisonnement est correct', '"Rien" a deux sens différents (équivoque)', 'Les sandwichs sont meilleurs', 'La pizza n\'est pas de la nourriture'], answer: 1 },
      { q: '"Rendre visite à des parents peut être ennuyeux." Combien de sens cela a-t-il ?', choices: ['Un', 'Deux — leur rendre visite OU des parents qui rendent visite', 'Trois', 'Aucun — c\'est clair'], answer: 1 },
      { q: 'Une bonne définition doit être :', choices: ['La plus courte possible', 'Ni trop large ni trop étroite', 'La plus longue possible', 'La même chose qu\'un exemple'], answer: 1 },
      { q: '"Ce film était cool." Est-ce assez précis pour un argument logique ?', choices: ['Oui — tout le monde sait ce que cool veut dire', 'Non — "cool" est vague et veut dire des choses différentes', 'Seulement pour les films d\'action', 'Oui — ça veut dire que la température était basse'], answer: 1 },
      { q: '"Toutes les étoiles sont des gens célèbres." Est-ce vrai ?', choices: ['Oui', 'Non — "étoile" est ambigu (objets célestes vs célébrités)', 'Seulement la nuit', 'Seulement à Hollywood'], answer: 1 },
      { q: 'Pour éviter l\'ambiguïté dans un argument, tu devrais :', choices: ['Utiliser les mots les plus courts possibles', 'Définir clairement tes termes clés', 'Utiliser autant de mots que possible', 'Éviter d\'utiliser des noms'], answer: 1 }
    ]
  },

  'categorical-syllogisms': {
    title: 'Tous, Aucun, Quelques : Les Syllogismes Catégoriques',
    content: `Un SYLLOGISME CATÉGORIQUE est un argument avec exactement deux prémisses et une conclusion, qui utilise les mots TOUS, AUCUN et QUELQUES.

Les quatre types de propositions catégoriques :
- TOUS les S sont P (Universelle affirmative) : "Tous les chiens sont des animaux"
- AUCUN S n'est P (Universelle négative) : "Aucun poisson n'est un oiseau"
- QUELQUES S sont P (Particulière affirmative) : "Quelques élèves sont des athlètes"
- QUELQUES S ne sont pas P (Particulière négative) : "Quelques animaux ne sont pas des animaux de compagnie"

Un syllogisme valide suit des règles. En voici un classique :
  Tous les humains sont mortels. (Tous M sont P)
  Tous les Grecs sont des humains. (Tous S sont M)
  Donc, tous les Grecs sont mortels. (Tous S sont P)

Le TERME MOYEN (humains/M) relie les deux prémisses mais N'APPARAÎT PAS dans la conclusion.

Exemple INVALIDE (le "moyen terme non distribué") :
  Tous les chiens sont des animaux.
  Tous les chats sont des animaux.
  Donc, tous les chats sont des chiens. FAUX !

Le terme moyen "animaux" n'est jamais utilisé pour TOUS les animaux, donc il ne relie pas correctement.

Les diagrammes de Venn nous aident à VOIR si un syllogisme est valide en dessinant des cercles pour chaque catégorie.`,
    questions: [
      { q: '"Tous les chiens sont des animaux" est de quel type ?', choices: ['Universelle négative', 'Universelle affirmative', 'Particulière affirmative', 'Particulière négative'], answer: 1 },
      { q: '"Aucun poisson n\'est un mammifère" est de quel type ?', choices: ['Universelle affirmative', 'Universelle négative', 'Particulière affirmative', 'Particulière négative'], answer: 1 },
      { q: '"Quelques oiseaux peuvent nager" est de quel type ?', choices: ['Universelle affirmative', 'Universelle négative', 'Particulière affirmative', 'Particulière négative'], answer: 2 },
      { q: '"Quelques animaux ne sont pas des animaux de compagnie" est de quel type ?', choices: ['Universelle affirmative', 'Universelle négative', 'Particulière affirmative', 'Particulière négative'], answer: 3 },
      { q: 'Un syllogisme catégorique a combien de prémisses ?', choices: ['Une', 'Deux', 'Trois', 'N\'importe quel nombre'], answer: 1 },
      { q: '"Tous M sont P. Tous S sont M. Donc tous S sont P." C\'est :', choices: ['Invalide', 'Valide', 'Parfois valide seulement', 'Un paradoxe'], answer: 1 },
      { q: 'Le TERME MOYEN dans un syllogisme :', choices: ['Apparaît dans la conclusion', 'Relie les deux prémisses mais pas la conclusion', 'Est toujours le sujet', 'Est facultatif'], answer: 1 },
      { q: '"Tous les chiens sont des animaux. Tous les chats sont des animaux. Donc tous les chats sont des chiens." C\'est :', choices: ['Valide', 'Invalide — le terme moyen n\'est pas distribué', 'Valide mais faux', 'Une tautologie'], answer: 1 },
      { q: '"Aucun reptile n\'a de fourrure. Les chiens ont de la fourrure. Donc les chiens ne sont pas des reptiles." Est-ce valide ?', choices: ['Non', 'Oui', 'Seulement pour les chiens', 'Il nous faut plus d\'informations'], answer: 1 },
      { q: '"Quelques élèves sont des athlètes. Quelques athlètes sont grands. Donc quelques élèves sont grands." Est-ce valide ?', choices: ['Oui — ça a du sens', 'Non — "quelques" ne garantit pas le chevauchement', 'Seulement pour le sport', 'Toujours valide'], answer: 1 },
      { q: '"Tous les A sont B. Aucun B n\'est C. Donc aucun A n\'est C." Est-ce valide ?', choices: ['Non', 'Oui', 'Seulement si A existe', 'Ça dépend'], answer: 1 },
      { q: 'Les diagrammes de Venn nous aident avec les syllogismes en :', choices: ['Les rendant plus jolis', 'Montrant visuellement si les catégories se chevauchent correctement', 'Remplaçant le besoin de logique', 'Ne fonctionnant qu\'avec des nombres'], answer: 1 },
      { q: '"Tous les héros sont courageux. Quelques pompiers sont des héros. Donc quelques pompiers sont courageux." Valide ?', choices: ['Non', 'Oui', 'Seulement en cas d\'urgence', 'On ne peut pas savoir'], answer: 1 },
      { q: 'Si "Tous les A sont B" est vrai, qu\'est-ce qui doit aussi être vrai ?', choices: ['"Quelques A sont B"', '"Tous les B sont A"', '"Aucun A n\'est B"', '"Quelques B ne sont pas A"'], answer: 0 }
    ]
  },

  'causal-reasoning': {
    title: 'Cause ou Coïncidence ?',
    content: `Le fait que deux choses se produisent ensemble ne signifie PAS que l'une CAUSE l'autre ! C'est l'une des leçons les plus importantes en logique.

La CORRÉLATION signifie que deux choses ont tendance à se produire ensemble :
- Les ventes de glaces augmentent ET les noyades augmentent en été
- La glace CAUSE-t-elle les noyades ? NON ! Les deux sont causés par la chaleur !

La CAUSALITÉ signifie qu'une chose FAIT réellement arriver une autre :
- Faire tomber un verre LE FAIT se casser
- Appuyer sur un interrupteur ALLUME la lumière

Les erreurs courantes :
LE SOPHISME POST HOC : "Après que X s'est passé, Y s'est passé, donc X a causé Y"
- "J'ai mis mes chaussettes porte-bonheur et on a gagné le match !" Les chaussettes ont-elles causé la victoire ? Non !
- "Un coq chante avant le lever du soleil, donc le coq fait lever le soleil !" Évidemment pas !

LES VARIABLES CONFONDANTES : Une troisième chose cachée cause les deux :
- Les enfants qui mangent le petit-déjeuner ont de meilleures notes. Le petit-déjeuner cause-t-il de bonnes notes ?
- Peut-être : les familles qui donnent le petit-déjeuner donnent AUSSI un soutien scolaire (la cause cachée)

Pour prouver la causalité, il faut :
1. La cause vient AVANT l'effet
2. Changer la cause CHANGE l'effet
3. Aucune autre explication ne fonctionne mieux`,
    questions: [
      { q: 'La corrélation signifie :', choices: ['Une chose cause l\'autre', 'Deux choses se produisent ensemble', 'Rien n\'est lié', 'Tout est aléatoire'], answer: 1 },
      { q: 'La causalité signifie :', choices: ['Deux choses sont sans rapport', 'Une chose FAIT réellement arriver une autre', 'Des choses se passent en même temps', 'Une coïncidence'], answer: 1 },
      { q: '"Les ventes de glaces et les noyades augmentent toutes les deux en été." C\'est un exemple de :', choices: ['Causalité', 'Corrélation sans causalité', 'Pure coïncidence', 'Un paradoxe'], answer: 1 },
      { q: '"J\'ai mis mes chaussettes porte-bonheur et on a gagné !" C\'est un exemple de :', choices: ['Bon raisonnement', 'Sophisme post hoc', 'Causalité', 'Science'], answer: 1 },
      { q: 'Le sophisme POST HOC consiste à :', choices: ['Supposer que quelque chose qui s\'est passé après X a été causé par X', 'Prouver correctement la causalité', 'Un type d\'argument', 'Toujours avoir raison'], answer: 0 },
      { q: 'Une VARIABLE CONFONDANTE est :', choices: ['Une variable qui prouve la causalité', 'Un troisième facteur caché qui cause les deux choses', 'L\'effet dans une expérience', 'Un fait sans rapport'], answer: 1 },
      { q: '"Les pays qui consomment plus de chocolat gagnent plus de prix Nobel." Le chocolat cause-t-il le génie ?', choices: ['Oui — le chocolat nourrit le cerveau', 'Non — les pays riches ont à la fois plus de chocolat ET plus de financement de la recherche', 'Seulement le chocolat noir', 'Il nous faut plus de données'], answer: 1 },
      { q: 'Pour prouver la causalité, la cause doit venir :', choices: ['Après l\'effet', 'Avant l\'effet', 'En même temps', 'Ça n\'a pas d\'importance'], answer: 1 },
      { q: '"Un coq chante, puis le soleil se lève. Le coq cause le lever du soleil." Qu\'est-ce qui ne va pas ?', choices: ['Rien — les coqs causent bien le lever du soleil', 'Le chant du coq et le lever du soleil sont tous deux causés par l\'heure du jour', 'Les coqs ne sont pas assez forts', 'Le soleil cause le coq'], answer: 1 },
      { q: '"Les élèves qui lisent davantage ont de meilleures notes." Pour prouver que la lecture CAUSE de meilleures notes, que faudrait-il ?', choices: ['Juste la corrélation', 'Une expérience contrôlée où certains élèves lisent plus et d\'autres non', 'Demander aux élèves', 'Rien — c\'est évident'], answer: 1 },
      { q: '"La criminalité augmente quand les ventes de glaces augmentent." La variable cachée est probablement :', choices: ['La glace', 'La criminalité', 'La chaleur (l\'été)', 'La police'], answer: 2 },
      { q: '"Chaque fois que je lave ma voiture, il pleut le lendemain." C\'est :', choices: ['De la causalité', 'Probablement une coïncidence ou un souvenir sélectif', 'La preuve que laver une voiture cause la pluie', 'De la science'], answer: 1 },
      { q: 'Quelle est la preuve la PLUS SOLIDE de la causalité ?', choices: ['Deux choses se produisent ensemble une fois', 'Deux choses se produisent toujours ensemble', 'Une expérience contrôlée montre que changer l\'un change fiablement l\'autre', 'Beaucoup de gens le croient'], answer: 2 },
      { q: '"Les enfants qui jouent aux jeux vidéo sont plus agressifs." Une variable confondante possible est :', choices: ['Les jeux vidéo eux-mêmes', 'Les enfants déjà agressifs préfèrent peut-être les jeux violents', 'L\'écran de télévision', 'Rien — les jeux causent l\'agressivité'], answer: 1 }
    ]
  }
};
