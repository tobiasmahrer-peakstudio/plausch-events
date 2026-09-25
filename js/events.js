/* PLAUSCH — Eventdaten
   Eine Datei für alle Events: Karte in der Übersicht + Highlight-Seite.
   Felder ohne Wert werden auf der Seite einfach weggelassen.
   Texte bei Infos / Anreise sind Vorlagen und pro Event anzupassen.
   upcoming: true → kommendes Event (Tickets, Line-up, kein Album/Aftermovie).
   locked: true → Karte in der Übersicht nicht klickbar, keine Highlight-Seite. */
window.PLAUSCH_EVENTS = [
  {
    slug: 'eclipse-ride',
    upcoming: true, // findet noch statt → Ticket-Seite statt Rückblick
    name: 'Eclipse Ride',
    tag: 'Sunset Session',
    font: 'sans',
    hue: '#5b8fd9', bg: '#0b1322',
    cover: 'assets/ig/eclipse-poster.jpg',
    date: 'Mi, 12. August 2026',
    time: '18:45 – 21:45',
    place: 'Glacier 3000',
    region: 'Les Diablerets',
    intro: 'Am 12. August 2026 schiebt sich der Mond vor die Sonne – und wir feiern mittendrin: Eclipse Ride holt die Sonnenfinsternis auf 3000 Meter über Meer. Von 18:45 bis 21:45 Uhr tanzen wir auf dem Glacier 3000 über den Gletschern der Alpen, während Blueäm und Rici den passenden Sound zum Licht liefern – vom goldenen Abendlicht über den Moment der Finsternis bis in die Dämmerung. Hinauf geht es mit der Seilbahn ab Col du Pillon, nach dem Event direkt wieder ins Tal.',
    album: ['assets/ig/eclipse-poster.jpg', 'assets/ig/moment-01.jpg', 'assets/ig/moment-02.jpg', 'assets/ig/eclipse-info.jpg'],
    acts: [
      { name: 'Blueäm', label: 'Label folgt' },
      { name: 'Rici', label: 'Label folgt' },
    ],
    infos: [
      ['Warme Kleidung', 'Auf dem Gletscher wird es nach Sonnenuntergang schnell kühl – nimm eine warme Jacke mit.'],
      ['Letzte Talfahrt', 'Die letzte Seilbahn ins Tal fährt direkt nach dem Event.'],
      ['Ab 18 Jahren', 'Eintritt ab 18 Jahren – bitte einen gültigen Ausweis mitnehmen.'],
      ['Bargeldlos bezahlen', 'Vor Ort bezahlst du mit Karte oder TWINT.'],
    ],
    travel: {
      address: 'Glacier 3000, Talstation Col du Pillon, 1865 Les Diablerets', map: 'Glacier 3000 Col du Pillon, Les Diablerets',
      oev: 'Mit dem Postauto ab Gstaad oder Les Diablerets bis Col du Pillon, dann mit der Seilbahn auf den Gletscher.',
      auto: 'Parkplätze an der Talstation Col du Pillon.',
    },
  },
  {
    slug: 'plausch-x-menuhin',
    name: 'Plausch × Menuhin',
    tag: 'Mountain Spirit',
    font: 'sans',
    hue: '#f0662c', bg: '#1f0f08',
    cover: 'assets/ig/menuhin-poster.jpg',
    date: 'Do, 6. August 2026',
    place: 'Berghaus Eggli, Terrasse',
    region: 'Gstaad',
    intro: 'Zum dritten Mal holen Plausch Events und das Menuhin Festival Gstaad die Musik auf den Hausberg: Unter dem Titel «Mountain Spirit | Swing & Electro» trifft auf der Terrasse des Berghaus Eggli die goldene Swing-Ära auf elektronische Clubkultur. Die Swingin\' Hermlins eröffnen mit Klassikern der 30er- und 40er-Jahre, Natascha Polké verbindet Live-Gesang mit elektronischen Beats und Kellerkind (Stil vor Talent) führt mit House und Techno in die Nacht – mit Blick über das Saanenland und ganz im Zeichen des Festival-Mottos «Family Matters».',
    album: ['assets/ig/menuhin-poster.jpg', 'assets/ig/menuhin-stage.jpg', 'assets/ig/moment-03.jpg'],
    albumDemo: 14, // Platzhalter-Bilder (Farbverlauf) zur Vorschau – entfernen, sobald echte Fotos da sind
    press: {
      source: 'Anzeiger von Saanen',
      date: '11. August 2026',
      author: 'Andrea von Allmen',
      title: 'Vom Swing in die Clubnacht',
      teaser: 'Swing-Klassiker der Swingin\' Hermlins zum Auftakt, danach Live-Elektronik von Natascha Polké und ein House- und Techno-Set von Kellerkind: Der Anzeiger von Saanen war dabei, als auf dem Eggli Jung und Alt gemeinsam tanzten – ganz im Sinne des Festival-Mottos «Family Matters».',
      url: 'https://www.anzeigervonsaanen.ch/vom-swing-in-die-clubnacht',
    },
    acts: [
      { name: "The Swingin' Hermlins", role: 'Live', img: 'assets/ig/artist-hermlins.jpg' },
      { name: 'Natascha Polké', role: 'Live', img: 'assets/ig/artist-polke.jpg' },
      { name: 'Kellerkind', role: 'DJ', label: 'Stil vor Talent', img: 'assets/ig/artist-kellerkind.jpg' },
    ],
    noInfos: true, // Rückblick: ohne Wichtige Infos und Ort & Anreise
  },
  {
    slug: 'ontop', locked: true, name: 'ON:TOP', tag: 'Daydance', font: 'sans', date: '30. Mai 2026',
    hue: '#7fa3d6', bg: '#0e1624', cover: 'assets/ig/hl_ontop.jpg',
    intro: 'Tanzen unter freiem Himmel – vom ersten Sonnenstrahl bis in den Abend.',
  },
  {
    slug: 'montreux-jazz', locked: true, name: 'Montreux Jazz', tag: 'Festival', font: 'sans',
    hue: '#e98a3c', bg: '#1e1216', cover: 'assets/ig/hl_montreux.jpg',
    date: '7. – 18. Juli', place: 'Montreux',
    intro: 'Plausch am Montreux Jazz Festival – zwölf Tage Musik direkt am Genfersee.',
    travel: {
      address: 'Montreux, am Seeufer', map: 'Montreux Jazz Festival, Montreux',
      oev: 'Ab Bahnhof Montreux in wenigen Gehminuten zum Festivalgelände am See.',
    },
  },
  {
    slug: 'wasserngrat', locked: true, name: 'Wasserngrat', tag: 'Mountain Party', font: 'sans',
    hue: '#5f8f4e', bg: '#0d1509', cover: 'assets/ig/hl_wasserngrat.jpg',
    date: '11. Juli 2026', place: 'Wasserngrat', region: 'Gstaad',
    intro: 'Party auf dem Hausberg von Gstaad – mit Aussicht über das ganze Saanenland.',
    travel: {
      address: 'Wasserngrat, 3780 Gstaad', map: 'Bergrestaurant Wasserngrat, Gstaad',
      oev: 'Mit der Sesselbahn Wasserngrat ab Gstaad.',
    },
  },
  {
    slug: 'pasa-daydance', locked: true, name: 'Pasa Daydance', tag: 'Winter Daydance', font: 'sans',
    hue: '#a9b8c8', bg: '#10141a', cover: 'assets/ig/hl_pasa.jpg',
    intro: 'Schnee, Sonne und Musik: ein Daydance mitten im Winter.',
  },
  {
    slug: 'the-old-station', locked: true, name: 'The Old Station', tag: 'Night', font: 'ransom',
    hue: '#9fb6cc', bg: '#0f1318', cover: 'assets/ig/hl_oldstation.jpg',
    intro: 'Eine Nacht in der alten Station – roh, laut und ein bisschen anders.',
  },
  {
    slug: 'force-of-nature', locked: true, name: 'Force of Nature', tag: '× Menuhin Festival', font: 'lower',
    hue: '#b23a86', bg: '#1a0913', cover: 'assets/ig/hl_force.jpg',
    place: 'Gstaad',
    intro: 'Force of Nature – eine Nacht in Zusammenarbeit mit dem Menuhin Festival Gstaad.',
  },
  {
    slug: 'ontop-25', locked: true, name: 'ON:TOP 25', tag: 'Daydance', font: 'sans',
    hue: '#9ccc3c', bg: '#10160a', cover: 'assets/ig/hl_ontop25.jpg',
    date: '31. Mai 2025',
    intro: 'Die Ausgabe 2025 unseres Daydance ON:TOP.',
  },
  {
    slug: 'jungle-fever', locked: true, name: 'Jungle Fever', tag: 'Night', font: 'groovy',
    hue: '#3f9a73', bg: '#081410', cover: 'assets/ig/hl_jungle.jpg',
    intro: 'Tief grün, schwül und laut – eine Nacht im Dschungel.',
  },
];

/* Vorlagen für Events ohne eigene Angaben */
window.PLAUSCH_DEFAULTS = {
  infos: [
    ['Ab 18 Jahren', 'Eintritt ab 18 Jahren – bitte einen gültigen Ausweis mitnehmen.'],
    ['Bargeldlos bezahlen', 'Vor Ort bezahlst du mit Karte oder TWINT.'],
    ['Bei jeder Witterung', 'Der Event findet bei jeder Witterung statt. Bei Unwetter informieren wir kurzfristig auf Instagram.'],
  ],
  qa: [
    ['Wo bekomme ich Tickets?', 'Tickets gibt es online über eventfrog, verlinkt unter „Tickets“. Wenn verfügbar, auch an der Abendkasse.'],
    ['Gibt es eine Altersgrenze?', 'Ja, Eintritt ab 18 Jahren. Bitte einen gültigen Ausweis mitnehmen.'],
    ['Was passiert bei schlechtem Wetter?', 'Der Event findet grundsätzlich bei jeder Witterung statt. Bei Unwetter informieren wir kurzfristig auf Instagram.'],
    ['Kann ich mein Ticket weitergeben?', 'Ja, Tickets sind übertragbar. Rückerstattungen sind nicht möglich.'],
  ],
};
