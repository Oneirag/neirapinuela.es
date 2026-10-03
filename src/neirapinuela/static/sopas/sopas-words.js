// Vocabulario para Sopas de Letras (en español)
const SOPAS_WORDS = {
    animales: [
        "LEON", "TIGRE", "OSO", "LOBO", "ZORRO", "AGUILA", "AVESTRUZ", "BUFALO",
        "CANGURO", "DELFIN", "ELEFANTE", "FENIX", "HIPO", "IGUANA",
        "JIRAFA", "CANGURO", "LORO", "MONO", "OVEJA", 
        "RANA", "SERPIENTE", "TIBURON", "VENADO", "LEOPARDO", "CABALLO", "PINGUINO",
        "CONEJO", "EMU", "GUANACO",
        "IBIS", "JERBO", "LLAMA", "FENEC", "ÑANDU", "RAPAZ",
        "SARDINA", "TARANTULA", "VACA", "YACARE", "LIEBRE"
    ],
    deportes: [
        "FUTBOL", "BALONCESTO", "TENIS", "NATACION", "ATLETISMO", "CICLISMO",
        "BOXEO", "CRICKET", "GOLF", "JUDO", "KAYAK", 
        "OLIMPIADA", "REGATAS", "SKATING", "TAEKWONDO", "VOLEIBOL", "GIMNASIA",
        "BEISBOL", "ESCALADA", "FUTBOLIN",
        "GLOBO", "HALTEROFILIA", "JUEGOS", "MARATON",
        "PARACAIDISMO", "RUGBY", "TRIATLON", "HOCKEY", "PATINAJE", "BALONMANO"
    ],
    comidas: [
        "ENSALADA", "SANDWICH", "PASTEL", "GALLETA", "POSTRE", "COCIDO", "PAPAS",
        "TORTILLA", "ARROZ", "PESCADO", "POLLO", "CARNE", "SOPA", "QUESOS",
        "YOGURT", "TACOS", "BURRITO", "SUSHI", "TOSTADA", "BEBIDAS", "ZUMO",
        "ALMEJAS", "BOLOÑESA", "CAFE", "DONUT", "FRUTA", "GELATINA",
        "HUEVO", "FLAN", "JALEA", "KIWI", "MANGO", "NACHOS",
        "PAELLA", "QUESADILLA", "RABANITO", "TAMAL", "UVA", "VICHYSSOISE"
    ],
    cocina: [
        "LAVAVAJILLAS", "LICUADORA", "BATIDORA", "HORNO", "VITROCERAMICA", "CAZUELA", "TENEDOR",
        "CUCHARA", "PLATOS", "TAZAS", "OLLAS", "CAFETERA", "SALSERA",
        "ESPECIAS", "ACEITE", "PICAR", "RALLADOR", "TABLA", 
        "VERDURAS", "AGUA", "MESA", "CUCHILLO", 
        "EXPRIMIDOR", "CALDERO", 
        "SAL", "ACEITE", "VINAGRE", "FREIDORA", "HARINA", "JARRA"
    ],
    paises: [
        "ESPAÑA", "FRANCIA", "ITALIA", "ALEMANIA", "PORTUGAL", "BRASIL", "MEXICO", "ARGENTINA",
        "CANADA", "JAPON", "CHINA", "INDIA", "AUSTRALIA", "EGIPTO", "GRECIA", "SUIZA",
        "SUECIA", "NORUEGA", "CHILE", "COLOMBIA", "PERU", "MARRUECOS", "TAILANDIA", "VIETNAM",
        "IRLANDA", "BELGICA", "AUSTRIA", "TURQUIA", "KENIA", "RUSIA", "UCRANIA", "POLONIA"
    ],
    ciudades: [
        "MADRID", "BARCELONA", "PARIS", "LONDRES", "ROMA", "BERLIN", "TOKIO", "PEKIN",
        "NUEVA YORK", "AMSTERDAM", "PRAGA", "VIENA", "LISBOA", "DUBLIN", "EL CAIRO", "NAIROBI",
        "SIDNEY", "MOSCU", "BUENOS AIRES", "BOGOTA", "SANTIAGO", "LIMA", "MEXICO DF", "CARACAS",
        "SEVILLA", "VALENCIA", "BILBAO", "GRANADA", "MILAN", "VENECIA", "FLORENCIA", "ESTAMBUL"
    ],
    personajes: [
        "CERVANTES", "PICASSO", "DALI", "COLON", "EINSTEIN", "NEWTON", "DARWIN", "GANDHI",
        "LINCOLN", "NAPOLEON", "DA VINCI", "MOZART", "BEETHOVEN", "SHAKESPEARE", "ARISTOTELES", "PLATON",
        "CLEOPATRA", "MANDELA", "GALILEO", "COPERNICO", "TESLA", "EDISON", "CURIE", "GAUDI",
        "VELAZQUEZ", "GOYA", "LORCA", "MACHADO", "RAFAEL", "MICHELANGELO"
    ]
};

const SOPAS_CATEGORIES = [
    { id: 'animales', name: 'Animales' },
    { id: 'deportes', name: 'Deportes' },
    { id: 'comidas', name: 'Comidas' },
    { id: 'cocina', name: 'Cocina' },
    { id: 'paises', name: 'Países' },
    { id: 'ciudades', name: 'Ciudades' },
    { id: 'personajes', name: 'Personajes' }
];

const SOPAS_DEFAULTS = {
    gridSize: 15,
    wordsPerGame: 8,
    difficulty: 'normal'
};