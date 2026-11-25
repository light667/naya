const path = require('path');
const fs = require('fs');
const pptxgen = require('C:/Users/netha/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pptxgenjs');

async function buildPresentation() {
  const pptx = new pptxgen();

  pptx.layout = 'LAYOUT_16x9'; // 10.0 x 5.625 inches
  pptx.author = 'Équipe PHAR';
  pptx.company = 'PHAR';
  pptx.title = 'PHAR - Présentation Officielle';
  pptx.subject = 'Plateforme intelligente de valorisation des compétences et d\'accès aux opportunités';

  // Couleurs de la charte officielle PHAR
  const NAVY = '0A2A5C';
  const DEEP_NAVY = '061836';
  const TURQUOISE = '22C3C9';
  const GOLD = 'FFB81C';
  const BG_LIGHT = 'F4FAFC';
  const WHITE = 'FFFFFF';
  const CARD_BORDER = 'D8E8F0';
  const TEXT_MUTED = '536B88';
  const TEXT_DARK = '0A2A5C';
  const CARD_DARK = '0E3875';
  const CARD_DARK_BORDER = '22C3C9';
  const FONT_TITLE = 'Segoe UI';
  const FONT_BODY = 'Segoe UI';

  const logoPath = path.resolve(__dirname, 'public/img/logo_phar_trimmed.png');
  const imgAccueil = path.resolve(__dirname, 'public/img/accueil.jpg');
  const imgVendeuse = path.resolve(__dirname, 'public/img/vendeuse.jpg');
  const imgHero = path.resolve(__dirname, 'public/img/hero.jpg');
  const imgMentor = path.resolve(__dirname, 'public/img/mentor.jpg');

  // Helper pour ajouter le header standard sur les diapositives de contenu
  function addHeader(slide, categoryText, mainTitle, subtitleText, slideNumberStr) {
    // Badge de catégorie
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 0.35, w: 2.8, h: 0.28,
      fill: { color: NAVY },
      rectRadius: 0.08
    });
    slide.addText(categoryText.toUpperCase(), {
      x: 0.8, y: 0.35, w: 2.8, h: 0.28,
      fontFace: FONT_TITLE, fontSize: 8.5, bold: true, color: GOLD,
      align: 'center', valign: 'middle'
    });

    // Grand Titre
    slide.addText(mainTitle, {
      x: 0.8, y: 0.68, w: 7.2, h: 0.45,
      fontFace: FONT_TITLE, fontSize: 18, bold: true, color: NAVY,
      valign: 'middle'
    });

    // Sous-titre
    slide.addText(subtitleText, {
      x: 0.8, y: 1.12, w: 7.4, h: 0.32,
      fontFace: FONT_BODY, fontSize: 10.5, color: TEXT_MUTED,
      valign: 'top'
    });

    // Logo miniature en haut à droite
    slide.addImage({
      path: logoPath,
      x: 8.35, y: 0.32, w: 0.85, h: 0.32
    });

    // Ligne de pied de page discrète
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8, y: 5.25, w: 8.4, h: 0,
      line: { color: 'E2ECF2', width: 0.8 }
    });

    // Métadonnées de pied de page
    slide.addText('PHAR  •  Plateforme intelligente de valorisation des compétences & d\'accès aux opportunités', {
      x: 0.8, y: 5.3, w: 6.5, h: 0.22,
      fontFace: FONT_BODY, fontSize: 8, color: TEXT_MUTED
    });

    slide.addText(slideNumberStr, {
      x: 8.2, y: 5.3, w: 1.0, h: 0.22,
      fontFace: FONT_TITLE, fontSize: 8.5, bold: true, color: NAVY,
      align: 'right'
    });
  }

  // ==========================================
  // SLIDE 1 : PAGE DE GARDE
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: NAVY };

    // Accent décoratif haut
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 0.55, w: 3.5, h: 0.28,
      fill: { color: CARD_DARK },
      line: { color: TURQUOISE, width: 1 },
      rectRadius: 0.08
    });
    slide.addText('CONCOURS D\'INNOVATION  •  PITCH HACKATHON', {
      x: 0.8, y: 0.55, w: 3.5, h: 0.28,
      fontFace: FONT_TITLE, fontSize: 8.5, bold: true, color: TURQUOISE,
      align: 'center', valign: 'middle'
    });

    // Logo PHAR grand format
    slide.addImage({
      path: logoPath,
      x: 0.8, y: 1.05, w: 2.2, h: 0.72
    });

    // Titre & Slogan
    slide.addText([
      { text: 'PHAR\n', options: { fontSize: 32, bold: true, color: GOLD } },
      { text: '« Tes compétences ont de la valeur.\n', options: { fontSize: 16, bold: true, italic: true, color: WHITE } },
      { text: 'Transforme-les en opportunités. »', options: { fontSize: 16, bold: true, italic: true, color: TURQUOISE } }
    ], {
      x: 0.8, y: 1.85, w: 4.8, h: 1.45,
      fontFace: FONT_TITLE
    });

    // Courte description
    slide.addText(
      'Plateforme intelligente d\'inclusion économique guidant les jeunes femmes de 18 à 30 ans vers l\'emploi durable, la valorisation de leurs compétences informelles et l\'entrepreneuriat.',
      {
        x: 0.8, y: 3.35, w: 4.6, h: 0.75,
        fontFace: FONT_BODY, fontSize: 10.5, color: 'D8E8F5'
      }
    );

    // Tags d'impact
    const tags = [
      { text: 'Emploi & Inclusion', bg: CARD_DARK, col: WHITE },
      { text: 'Copilote IA Inclusif', bg: CARD_DARK, col: TURQUOISE },
      { text: 'Impact Réel', bg: GOLD, col: NAVY }
    ];
    let curX = 0.8;
    tags.forEach(t => {
      slide.addShape(pptx.ShapeType.roundRect, {
        x: curX, y: 4.25, w: 1.45, h: 0.28,
        fill: { color: t.bg },
        rectRadius: 0.08
      });
      slide.addText(t.text, {
        x: curX, y: 4.25, w: 1.45, h: 0.28,
        fontFace: FONT_TITLE, fontSize: 8.5, bold: true, color: t.col,
        align: 'center', valign: 'middle'
      });
      curX += 1.55;
    });

    // Carte Visuelle Droite
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 5.75, y: 0.55, w: 3.45, h: 4.4,
      fill: { color: DEEP_NAVY },
      line: { color: TURQUOISE, width: 1.2 },
      rectRadius: 0.15
    });

    slide.addImage({
      path: imgAccueil,
      x: 5.9, y: 0.7, w: 3.15, h: 3.1
    });

    // Badge flottant sur l'image
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.0, y: 3.9, w: 2.95, h: 0.9,
      fill: { color: WHITE },
      line: { color: GOLD, width: 1.5 },
      rectRadius: 0.1
    });
    slide.addText([
      { text: 'RÉVÉLER LES TALENTS FÉMININS\n', options: { fontSize: 9, bold: true, color: NAVY } },
      { text: 'Passer de l\'informel à l\'opportunité économique.', options: { fontSize: 8.5, color: TEXT_MUTED } }
    ], {
      x: 6.1, y: 3.95, w: 2.75, h: 0.8,
      fontFace: FONT_BODY, align: 'center'
    });

    // Ligne bas
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8, y: 5.25, w: 8.4, h: 0,
      line: { color: '1C4378', width: 0.8 }
    });
    slide.addText('https://ai-phar.vercel.app  •  Dossier de candidature & Présentation projet', {
      x: 0.8, y: 5.3, w: 8.4, h: 0.22,
      fontFace: FONT_BODY, fontSize: 8, color: '89A5C4'
    });
  }

  // ==========================================
  // SLIDE 2 : LE PROBLÈME
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_LIGHT };
    addHeader(slide, 'Constat & Contexte', 'Des compétences réelles, mais invisibles et sous-exploitées', 'Les jeunes femmes de 18 à 30 ans font face à des barrières majeures vers l\'emploi.', '02 / 08');

    // Colonne gauche : Photo & Statistique percutante
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 1.6, w: 3.1, h: 2.1,
      fill: { color: WHITE },
      line: { color: CARD_BORDER, width: 1 },
      rectRadius: 0.12
    });
    slide.addImage({
      path: imgVendeuse,
      x: 0.9, y: 1.7, w: 2.9, h: 1.9
    });

    // Stat Box Choc
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 3.82, w: 3.1, h: 1.25,
      fill: { color: NAVY },
      line: { color: GOLD, width: 1.5 },
      rectRadius: 0.12
    });
    slide.addText([
      { text: '70%\n', options: { fontSize: 26, bold: true, color: GOLD } },
      { text: 'des jeunes femmes actives exercent dans l\'informel sans valorisation de leurs compétences réelles.', options: { fontSize: 8.5, color: WHITE } }
    ], {
      x: 0.95, y: 3.88, w: 2.8, h: 1.1,
      fontFace: FONT_TITLE, align: 'center'
    });

    // Colonne droite : Les 4 difficultés clés
    const problems = [
      {
        num: '01',
        title: 'Difficulté d\'accès à l\'emploi',
        desc: 'Exigence disproportionnée d\'expériences préalables et diplômes formels excluant les jeunes talents motivés.',
        tag: 'Barrière formelle'
      },
      {
        num: '02',
        title: 'Manque de réseau professionnel',
        desc: 'Absence de parrainage, d\'orientation et d\'accès direct aux décideurs et employeurs locaux.',
        tag: 'Isolement social'
      },
      {
        num: '03',
        title: 'Compétences informelles peu reconnues',
        desc: 'Savoir-faire artisanaux, commerce, négociation et gestion du quotidien invisibles sur les CV traditionnels.',
        tag: 'Invisibilité des acquis'
      },
      {
        num: '04',
        title: 'Manque d\'informations sur les opportunités',
        desc: 'Asymétrie de l\'information sur les appels d\'offres locaux, besoins des PME et formations qualifiantes.',
        tag: 'Déficit d\'accès'
      }
    ];

    problems.forEach((p, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 4.15 + col * 2.55;
      const y = 1.6 + row * 1.75;

      slide.addShape(pptx.ShapeType.roundRect, {
        x: x, y: y, w: 2.45, h: 1.65,
        fill: { color: WHITE },
        line: { color: CARD_BORDER, width: 1 },
        rectRadius: 0.1
      });

      // Pastille numéro
      slide.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.15, y: y + 0.15, w: 0.45, h: 0.25,
        fill: { color: (idx % 2 === 0 ? GOLD : TURQUOISE) },
        rectRadius: 0.06
      });
      slide.addText(p.num, {
        x: x + 0.15, y: y + 0.15, w: 0.45, h: 0.25,
        fontFace: FONT_TITLE, fontSize: 8.5, bold: true, color: NAVY,
        align: 'center', valign: 'middle'
      });

      // Titre du problème
      slide.addText(p.title, {
        x: x + 0.15, y: y + 0.45, w: 2.15, h: 0.38,
        fontFace: FONT_TITLE, fontSize: 10, bold: true, color: NAVY
      });

      // Description
      slide.addText(p.desc, {
        x: x + 0.15, y: y + 0.85, w: 2.15, h: 0.68,
        fontFace: FONT_BODY, fontSize: 8.5, color: TEXT_MUTED
      });
    });
  }

  // ==========================================
  // SLIDE 3 : NOTRE SOLUTION
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_LIGHT };
    addHeader(slide, 'La Réponse PHAR', 'Un pont entre les compétences et les besoins du marché', 'Une plateforme conçue pour valoriser chaque potentiel et le connecter aux opportunités.', '03 / 08');

    // 5 Cartes de fonctionnalités clés
    const solutions = [
      {
        step: '1',
        title: 'Identification des compétences',
        desc: 'Diagnostic interactif qui détecte les talents réels et compétences tacites acquises au quotidien.'
      },
      {
        step: '2',
        title: 'Création d\'un profil professionnel',
        desc: 'Génération instantanée d\'un profil valorisant, standardisé et prêt à l\'emploi pour le marché.'
      },
      {
        step: '3',
        title: 'Recommandations d\'activités',
        desc: 'Suggestions ciblées d\'activités rémunératrices, micro-services et missions génératrices de revenus.'
      },
      {
        step: '4',
        title: 'Mise en relation directe',
        desc: 'Connexion fluide avec les entreprises, PME et associations sans intermédiaires bloquants.'
      },
      {
        step: '5',
        title: 'Création d\'un portfolio',
        desc: 'Vitrine visuelle des réalisations concrètes partageable d\'un simple lien web ou QR code.'
      }
    ];

    solutions.forEach((s, idx) => {
      const y = 1.6 + idx * 0.68;

      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8, y: y, w: 5.2, h: 0.62,
        fill: { color: WHITE },
        line: { color: CARD_BORDER, width: 1 },
        rectRadius: 0.08
      });

      // Puce colorée
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.95, y: y + 0.12, w: 0.38, h: 0.38,
        fill: { color: idx % 2 === 0 ? NAVY : TURQUOISE },
        rectRadius: 0.06
      });
      slide.addText(s.step, {
        x: 0.95, y: y + 0.12, w: 0.38, h: 0.38,
        fontFace: FONT_TITLE, fontSize: 9.5, bold: true, color: idx % 2 === 0 ? GOLD : NAVY,
        align: 'center', valign: 'middle'
      });

      slide.addText([
        { text: `${s.title} : `, options: { bold: true, color: NAVY, fontSize: 9.5 } },
        { text: s.desc, options: { color: TEXT_MUTED, fontSize: 8.5 } }
      ], {
        x: 1.45, y: y + 0.06, w: 4.45, h: 0.5,
        fontFace: FONT_BODY, valign: 'middle'
      });
    });

    // Visuel droite
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.2, y: 1.6, w: 3.0, h: 2.2,
      fill: { color: WHITE },
      line: { color: CARD_BORDER, width: 1 },
      rectRadius: 0.12
    });
    slide.addImage({
      path: imgHero,
      x: 6.3, y: 1.7, w: 2.8, h: 2.0
    });

    // Box Impact Solution
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 6.2, y: 3.92, w: 3.0, h: 1.15,
      fill: { color: NAVY },
      line: { color: TURQUOISE, width: 1.5 },
      rectRadius: 0.12
    });
    slide.addText([
      { text: 'L\'INNOVATION PHAR\n', options: { fontSize: 9, bold: true, color: GOLD } },
      { text: 'Remplacer le CV conventionnel par une cartographie vivante et vérifiable des compétences.', options: { fontSize: 8.5, color: WHITE } }
    ], {
      x: 6.35, y: 4.0, w: 2.7, h: 1.0,
      fontFace: FONT_BODY, align: 'center'
    });
  }

  // ==========================================
  // SLIDE 4 : COMMENT FONCTIONNE PHAR ?
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: WHITE };
    addHeader(slide, 'Parcours Utilisatrice', 'Comment fonctionne PHAR ?', 'Un cheminement simple et intuitif en 4 étapes pour passer du talent au revenu.', '04 / 08');

    const steps = [
      {
        num: '01',
        title: 'Créer un profil',
        badgeColor: GOLD,
        textColor: NAVY,
        desc: 'L\'utilisatrice renseigne ses talents, expériences vécues, compétences pratiques et disponibilités en quelques questions simples sans jargon.',
        tag: '⏱️ 3 minutes'
      },
      {
        num: '02',
        title: 'Valoriser ses compétences',
        badgeColor: TURQUOISE,
        textColor: NAVY,
        desc: 'La plateforme transforme ces acquis en un profil professionnel valorisé et génère un portfolio numérique complet et crédible.',
        tag: '✨ Révélation'
      },
      {
        num: '03',
        title: 'Découvrir les opportunités',
        badgeColor: TURQUOISE,
        textColor: NAVY,
        desc: 'Recommandation intelligente de missions rémunérées, offres de stages, projets d\'entreprises et formations adaptées au profil.',
        tag: '🎯 Matching sur-mesure'
      },
      {
        num: '04',
        title: 'Postuler et suivre',
        badgeColor: NAVY,
        textColor: WHITE,
        desc: 'Préparation assistée de la candidature, mise en relation directe et suivi transparent des réponses en temps réel.',
        tag: '🚀 Connexion directe'
      }
    ];

    steps.forEach((st, idx) => {
      const x = 0.8 + idx * 2.15;
      const y = 1.6;

      slide.addShape(pptx.ShapeType.roundRect, {
        x: x, y: y, w: 2.0, h: 2.75,
        fill: { color: BG_LIGHT },
        line: { color: CARD_BORDER, width: 1 },
        rectRadius: 0.12
      });

      // Badge numéro
      slide.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.15, y: y + 0.15, w: 0.55, h: 0.32,
        fill: { color: st.badgeColor },
        rectRadius: 0.08
      });
      slide.addText(st.num, {
        x: x + 0.15, y: y + 0.15, w: 0.55, h: 0.32,
        fontFace: FONT_TITLE, fontSize: 10, bold: true, color: st.textColor,
        align: 'center', valign: 'middle'
      });

      // Tag durée/action
      slide.addText(st.tag, {
        x: x + 0.75, y: y + 0.15, w: 1.1, h: 0.32,
        fontFace: FONT_TITLE, fontSize: 7.5, bold: true, color: TEXT_MUTED,
        align: 'right', valign: 'middle'
      });

      // Titre
      slide.addText(st.title, {
        x: x + 0.15, y: y + 0.58, w: 1.7, h: 0.42,
        fontFace: FONT_TITLE, fontSize: 11, bold: true, color: NAVY
      });

      // Description
      slide.addText(st.desc, {
        x: x + 0.15, y: y + 1.05, w: 1.7, h: 1.55,
        fontFace: FONT_BODY, fontSize: 8.5, color: TEXT_MUTED
      });
    });

    // Bannière récapitulative bas
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 4.5, w: 8.45, h: 0.58,
      fill: { color: NAVY },
      line: { color: GOLD, width: 1.2 },
      rectRadius: 0.08
    });
    slide.addText('Accessible sur smartphone • Sans formulaire lourd • Pensé pour les réalités du terrain ouest-africain', {
      x: 0.8, y: 4.5, w: 8.45, h: 0.58,
      fontFace: FONT_TITLE, fontSize: 9.5, bold: true, color: WHITE,
      align: 'center', valign: 'middle'
    });
  }

  // ==========================================
  // SLIDE 5 : LE RÔLE DE L'INTELLIGENCE ARTIFICIELLE
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: DEEP_NAVY };

    // Header personnalisé pour fond sombre
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 0.35, w: 2.8, h: 0.28,
      fill: { color: CARD_DARK },
      line: { color: TURQUOISE, width: 1 },
      rectRadius: 0.08
    });
    slide.addText('INNOVATION TECHNOLOGIQUE', {
      x: 0.8, y: 0.35, w: 2.8, h: 0.28,
      fontFace: FONT_TITLE, fontSize: 8.5, bold: true, color: TURQUOISE,
      align: 'center', valign: 'middle'
    });

    slide.addText('Le rôle de l\'Intelligence Artificielle', {
      x: 0.8, y: 0.68, w: 7.2, h: 0.45,
      fontFace: FONT_TITLE, fontSize: 18, bold: true, color: WHITE,
      valign: 'middle'
    });

    slide.addText('Une IA bienveillante, inclusive et au service de l\'émancipation économique.', {
      x: 0.8, y: 1.12, w: 7.4, h: 0.32,
      fontFace: FONT_BODY, fontSize: 10.5, color: 'B3CEE8',
      valign: 'top'
    });

    slide.addImage({
      path: logoPath,
      x: 8.35, y: 0.32, w: 0.85, h: 0.32
    });

    // 4 Missions de l'IA en grille 2x2
    const aiRoles = [
      {
        icon: '🔍',
        title: 'Identifier les compétences',
        desc: 'L\'IA analyse sémantiquement les réponses et récits des utilisatrices pour détecter leurs savoir-faire réels et compétences informelles.'
      },
      {
        icon: '💡',
        title: 'Recommander des activités adaptées',
        desc: 'Moteur prédictif suggérant des activités génératrices de revenus et micro-missions alignées avec leurs forces et disponibilités.'
      },
      {
        icon: '🤝',
        title: 'Faire correspondre profils & missions',
        desc: 'Algorithme de smart-matching multicritère reliant instantanément les besoins précis des recruteurs aux profils disponibles.'
      },
      {
        icon: '✍️',
        title: 'Aider à rédiger les candidatures',
        desc: 'Assistant génératif guidant la rédaction de candidatures convaincantes et la présentation soignée des services proposés.'
      }
    ];

    aiRoles.forEach((r, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 0.8 + col * 4.3;
      const y = 1.6 + row * 1.5;

      slide.addShape(pptx.ShapeType.roundRect, {
        x: x, y: y, w: 4.15, h: 1.38,
        fill: { color: '0D2E5C' },
        line: { color: TURQUOISE, width: 1 },
        rectRadius: 0.1
      });

      slide.addText([
        { text: `${r.icon}  ${r.title}\n`, options: { bold: true, color: GOLD, fontSize: 11 } },
        { text: r.desc, options: { color: 'D8E8F5', fontSize: 9 } }
      ], {
        x: x + 0.2, y: y + 0.12, w: 3.75, h: 1.15,
        fontFace: FONT_BODY
      });
    });

    // Note d'éthique et garantie humaine
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 4.7, w: 8.45, h: 0.48,
      fill: { color: '091E3D' },
      line: { color: GOLD, width: 1.2 },
      rectRadius: 0.08
    });
    slide.addText('🛡️ IA Responsable : l\'IA assiste, oriente et amplifie — la décision humaine reste souveraine.', {
      x: 0.8, y: 4.7, w: 8.45, h: 0.48,
      fontFace: FONT_BODY, fontSize: 9, bold: true, color: WHITE,
      align: 'center', valign: 'middle'
    });

    // Pied de page slide sombre
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8, y: 5.25, w: 8.4, h: 0,
      line: { color: '1C4378', width: 0.8 }
    });
    slide.addText('PHAR  •  Intelligence Artificielle & Inclusion Numérique', {
      x: 0.8, y: 5.3, w: 6.5, h: 0.22,
      fontFace: FONT_BODY, fontSize: 8, color: '89A5C4'
    });
    slide.addText('05 / 08', {
      x: 8.2, y: 5.3, w: 1.0, h: 0.22,
      fontFace: FONT_TITLE, fontSize: 8.5, bold: true, color: GOLD,
      align: 'right'
    });
  }

  // ==========================================
  // SLIDE 6 : IMPACT ATTENDU & INDICATEURS
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: BG_LIGHT };
    addHeader(slide, 'Résultats & Valeur Créée', 'Impact attendu & Indicateurs de réussite', 'Transformer durablement la trajectoire professionnelle des jeunes femmes.', '06 / 08');

    // 4 Piliers d'impact
    const impacts = [
      {
        title: 'Insertion professionnelle',
        desc: 'Créer une passerelle concrète vers l\'emploi formel et les missions qualifiées.',
        color: NAVY
      },
      {
        title: 'Valorisation des talents',
        desc: 'Révéler et légitimer les savoir-faire féminins trop souvent invisibilisés.',
        color: TURQUOISE
      },
      {
        title: 'Accès aux opportunités',
        desc: 'Démocratiser l\'information économique et connecter aux marchés locaux.',
        color: NAVY
      },
      {
        title: 'Autonomie économique',
        desc: 'Générer des revenus durables et renforcer le pouvoir d\'agir des jeunes femmes.',
        color: GOLD
      }
    ];

    impacts.forEach((imp, idx) => {
      const x = 0.8 + idx * 2.15;
      const y = 1.6;

      slide.addShape(pptx.ShapeType.roundRect, {
        x: x, y: y, w: 2.0, h: 1.5,
        fill: { color: WHITE },
        line: { color: CARD_BORDER, width: 1 },
        rectRadius: 0.1
      });

      slide.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.15, y: y + 0.15, w: 0.35, h: 0.08,
        fill: { color: imp.color },
        rectRadius: 0.04
      });

      slide.addText(imp.title, {
        x: x + 0.15, y: y + 0.32, w: 1.7, h: 0.38,
        fontFace: FONT_TITLE, fontSize: 10, bold: true, color: NAVY
      });

      slide.addText(imp.desc, {
        x: x + 0.15, y: y + 0.72, w: 1.7, h: 0.7,
        fontFace: FONT_BODY, fontSize: 8.5, color: TEXT_MUTED
      });
    });

    // 4 Indicateurs Clés de Réussite (KPIs)
    const kpis = [
      { num: '+5 000', label: 'Jeunes femmes accompagnées dès la phase pilote', col: GOLD },
      { num: '85%', label: 'De compétences informelles traduites en profils certifiés', col: TURQUOISE },
      { num: 'x 3', label: 'Rapidité d\'accès à une première opportunité rémunératrice', col: NAVY },
      { num: '100+', label: 'Entreprises, PME & associations partenaires engagées', col: GOLD }
    ];

    kpis.forEach((k, idx) => {
      const x = 0.8 + idx * 2.15;
      const y = 3.35;

      slide.addShape(pptx.ShapeType.roundRect, {
        x: x, y: y, w: 2.0, h: 1.65,
        fill: { color: WHITE },
        line: { color: CARD_BORDER, width: 1 },
        rectRadius: 0.1
      });

      slide.addText(k.num, {
        x: x + 0.1, y: y + 0.15, w: 1.8, h: 0.55,
        fontFace: FONT_TITLE, fontSize: 24, bold: true, color: k.col,
        align: 'center'
      });

      slide.addText(k.label, {
        x: x + 0.15, y: y + 0.75, w: 1.7, h: 0.75,
        fontFace: FONT_BODY, fontSize: 8.5, color: TEXT_MUTED,
        align: 'center'
      });
    });
  }

  // ==========================================
  // SLIDE 7 : NOTRE APPROCHE
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: WHITE };
    addHeader(slide, 'Stratégie de Déploiement', 'Notre approche : agile, collaborative et ancrée terrain', 'Une méthodologie centrée sur l\'utilisatrice et l\'expérimentation concrète.', '07 / 08');

    const stepsApproche = [
      {
        num: '01',
        title: 'Écouter les utilisatrices',
        desc: 'Immersion terrain et ateliers pour cerner les besoins réels, freins et aspirations des jeunes femmes.',
        tag: 'Phase Écoute'
      },
      {
        num: '02',
        title: 'Développer le prototype',
        desc: 'Conception d\'une PWA web & mobile légère, réactive et testable dès aujourd\'hui sur ai-phar.vercel.app.',
        tag: 'Tech & Produit'
      },
      {
        num: '03',
        title: 'Tester la plateforme',
        desc: 'Phase pilote restreinte avec une cohorte initiale de talents pour éprouver chaque étape du parcours.',
        tag: 'Test Pilote'
      },
      {
        num: '04',
        title: 'Recueillir les retours',
        desc: 'Boucles d\'itération continue pour adapter l\'assistant IA et simplifier au maximum l\'interface.',
        tag: 'Amélioration'
      },
      {
        num: '05',
        title: 'Développer des partenariats',
        desc: 'Mobilisation d\'entreprises, PME, chambres consulaires et ONG locales pour sourcer des missions.',
        tag: 'Écosystème'
      },
      {
        num: '06',
        title: 'Sécurité & Confidentialité',
        desc: 'Vérification scrupuleuse des opportunités, respect de la vie privée et environnement bienveillant.',
        tag: 'Confiance'
      }
    ];

    stepsApproche.forEach((a, idx) => {
      const col = idx % 3;
      const row = Math.floor(idx / 3);
      const x = 0.8 + col * 2.85;
      const y = 1.6 + row * 1.68;

      slide.addShape(pptx.ShapeType.roundRect, {
        x: x, y: y, w: 2.75, h: 1.55,
        fill: { color: BG_LIGHT },
        line: { color: CARD_BORDER, width: 1 },
        rectRadius: 0.1
      });

      // Pastille étape
      slide.addShape(pptx.ShapeType.roundRect, {
        x: x + 0.15, y: y + 0.15, w: 0.45, h: 0.25,
        fill: { color: NAVY },
        rectRadius: 0.06
      });
      slide.addText(a.num, {
        x: x + 0.15, y: y + 0.15, w: 0.45, h: 0.25,
        fontFace: FONT_TITLE, fontSize: 8.5, bold: true, color: GOLD,
        align: 'center', valign: 'middle'
      });

      // Tag
      slide.addText(a.tag, {
        x: x + 0.7, y: y + 0.15, w: 1.85, h: 0.25,
        fontFace: FONT_TITLE, fontSize: 8, bold: true, color: TEXT_MUTED,
        align: 'right', valign: 'middle'
      });

      // Titre
      slide.addText(a.title, {
        x: x + 0.15, y: y + 0.45, w: 2.45, h: 0.35,
        fontFace: FONT_TITLE, fontSize: 10.5, bold: true, color: NAVY
      });

      // Description
      slide.addText(a.desc, {
        x: x + 0.15, y: y + 0.82, w: 2.45, h: 0.65,
        fontFace: FONT_BODY, fontSize: 8.5, color: TEXT_MUTED
      });
    });
  }

  // ==========================================
  // SLIDE 8 : PORTEUSE DU PROJET ET AMBITION
  // ==========================================
  {
    const slide = pptx.addSlide();
    slide.background = { color: NAVY };

    // Badge haut
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 0.4, w: 3.2, h: 0.28,
      fill: { color: CARD_DARK },
      line: { color: GOLD, width: 1 },
      rectRadius: 0.08
    });
    slide.addText('VISION, ENGAGEMENT & LEADERSHIP', {
      x: 0.8, y: 0.4, w: 3.2, h: 0.28,
      fontFace: FONT_TITLE, fontSize: 8.5, bold: true, color: GOLD,
      align: 'center', valign: 'middle'
    });

    slide.addText('Porteuse du projet et ambition', {
      x: 0.8, y: 0.72, w: 7.2, h: 0.45,
      fontFace: FONT_TITLE, fontSize: 18, bold: true, color: WHITE,
      valign: 'middle'
    });

    slide.addImage({
      path: logoPath,
      x: 8.35, y: 0.35, w: 0.85, h: 0.32
    });

    // Colonne gauche : Profil de la porteuse
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.8, y: 1.45, w: 3.9, h: 3.4,
      fill: { color: DEEP_NAVY },
      line: { color: TURQUOISE, width: 1.2 },
      rectRadius: 0.12
    });

    slide.addText('PORTEUSE DU PROJET PHAR', {
      x: 1.0, y: 1.65, w: 3.5, h: 0.3,
      fontFace: FONT_TITLE, fontSize: 10, bold: true, color: GOLD
    });

    const points = [
      'Engagement affirmé pour le numérique, l\'innovation technologique et l\'autonomisation des jeunes.',
      'Expérience concrète de terrain : participation au Togo IT Day comme membre du staff et hôtesse, au contact direct de l\'écosystème tech ouest-africain.',
      'Conviction profonde : la technologie doit servir d\'ascenseur social et d\'outil d\'égalité des chances pour les jeunes femmes.',
      'Leadership axé sur l\'impact réel, l\'écoute bienveillante et la rigueur d\'exécution.'
    ];

    let pY = 2.05;
    points.forEach(pt => {
      slide.addText(`•  ${pt}`, {
        x: 1.0, y: pY, w: 3.5, h: 0.65,
        fontFace: FONT_BODY, fontSize: 8.8, color: 'D8E8F5'
      });
      pY += 0.65;
    });

    // Colonne droite : Grande citation finale & Ambition
    // Grande boîte citation
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 4.95, y: 1.45, w: 4.3, h: 2.1,
      fill: { color: CARD_DARK },
      line: { color: GOLD, width: 1.5 },
      rectRadius: 0.12
    });

    slide.addText('“', {
      x: 5.15, y: 1.5, w: 1.0, h: 0.5,
      fontFace: FONT_TITLE, fontSize: 36, bold: true, color: GOLD
    });

    slide.addText(
      '« PHAR : révélons les talents, connectons-les aux opportunités et construisons un avenir plus autonome. »',
      {
        x: 5.2, y: 1.95, w: 3.85, h: 1.35,
        fontFace: FONT_TITLE, fontSize: 13, bold: true, italic: true, color: WHITE,
        align: 'center'
      }
    );

    // Boîte Ambition finale
    slide.addShape(pptx.ShapeType.roundRect, {
      x: 4.95, y: 3.75, w: 4.3, h: 1.1,
      fill: { color: DEEP_NAVY },
      line: { color: TURQUOISE, width: 1.2 },
      rectRadius: 0.1
    });

    slide.addText([
      { text: 'NOTRE AMBITION  •  HORIZON 2026\n', options: { fontSize: 9.5, bold: true, color: TURQUOISE } },
      { text: 'Faire de PHAR la plateforme panafricaine de référence pour transformer les compétences informelles en leviers d\'émancipation financière.', options: { fontSize: 8.5, color: 'D8E8F5' } }
    ], {
      x: 5.15, y: 3.82, w: 3.9, h: 0.95,
      fontFace: FONT_BODY, align: 'center'
    });

    // Ligne bas
    slide.addShape(pptx.ShapeType.line, {
      x: 0.8, y: 5.25, w: 8.4, h: 0,
      line: { color: '1C4378', width: 0.8 }
    });
    slide.addText('PHAR  •  https://ai-phar.vercel.app  •  Merci pour votre attention', {
      x: 0.8, y: 5.3, w: 6.5, h: 0.22,
      fontFace: FONT_BODY, fontSize: 8, color: '89A5C4'
    });
    slide.addText('08 / 08', {
      x: 8.2, y: 5.3, w: 1.0, h: 0.22,
      fontFace: FONT_TITLE, fontSize: 8.5, bold: true, color: GOLD,
      align: 'right'
    });
  }

  // Écriture du fichier final
  const outputPath = path.resolve(__dirname, 'Presentation_PHAR.pptx');
  const oldPath = path.resolve(__dirname, 'Presentation_NAYA (1).pptx');

  await pptx.writeFile({ fileName: outputPath });
  console.log(`Présentation créée avec succès : ${outputPath}`);

  // Également mettre à jour l'ancien fichier pour que l'utilisateur ait le fichier sous les deux noms
  try {
    fs.copyFileSync(outputPath, oldPath);
    console.log(`Fichier Presentation_NAYA (1).pptx mis à jour avec le contenu officiel PHAR.`);
  } catch (err) {
    console.warn(`Erreur lors de la copie vers Presentation_NAYA:`, err);
  }
}

buildPresentation().catch(err => {
  console.error('Erreur lors de la génération de la présentation :', err);
  process.exit(1);
});
