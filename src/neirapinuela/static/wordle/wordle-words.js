// ─────────────────────────────────────────────────────────────────────────────
// WORDLE ES — Lista de palabras en español
// ─────────────────────────────────────────────────────────────────────────────
// ANSWER_WORDS: palabras que pueden salir como respuesta del día.
//   - Deben tener exactamente 5 letras.
//   - Solo letras del alfabeto español (a-z + á é í ó ú ü ñ).
//   - Mejor usar palabras conocidas y de dificultad media.
//
// VALID_WORDS_EXTRA: palabras adicionales aceptadas como intento válido
//   aunque no sean respuesta. Ampliar con palabras menos comunes.
// ─────────────────────────────────────────────────────────────────────────────

const ANSWER_WORDS = [
    // Naturaleza y entorno
    'cielo', 'tierra', 'campo', 'monte', 'suelo', 'vuelo', 'hielo', 'fondo',
    'playa', 'noche', 'tarde', 'bosque', 'roble', 'limon', 'mango', 'fresa',
    'trigo', 'cacao', 'arena', 'nieve', 'lluvia', 'viento', 'niebla', 'rocio',

    // Animales
    'cerdo', 'oveja', 'tigre', 'zorro', 'cisne', 'palma',

    // Objetos cotidianos
    'libro', 'lapiz', 'carta', 'piano', 'arco', 'flauta', 'casco',
    'bota', 'falda', 'blusa', 'camisa', 'traje', 'plato', 'taza', 'silla',
    'cama', 'sofa', 'puerta', 'techo', 'jardin', 'fuente', 'lago',

    // Verbos / acciones
    'poder', 'tener', 'saber', 'queja', 'mirar', 'amar', 'tocar',

    // Palabras de 5 letras comunes
    'gatos', 'perro', 'casas', 'mundo', 'baile', 'bello', 'punto', 'fuego',
    'trozo', 'calma', 'barco', 'banco', 'cargo', 'clave', 'cuero', 'curva',
    'duelo', 'dulce', 'error', 'fardo', 'forma', 'fruta', 'garbo', 'genio',
    'gusto', 'habla', 'hecho', 'honor', 'huevo', 'juego', 'justo', 'labio',
    'largo', 'leche', 'libre', 'litro', 'llano', 'logro', 'lugar', 'lucha',
    'madre', 'manos', 'mares', 'media', 'mejor', 'melon', 'mente', 'metro',
    'miedo', 'mitad', 'molde', 'mosca', 'motor', 'muros', 'nariz', 'negro',
    'noble', 'norma', 'nuevo', 'oeste', 'olivo', 'orden', 'padre', 'papel',
    'pared', 'pecho', 'penas', 'pilar', 'pleno', 'polvo', 'poner', 'poste',
    'primo', 'punta', 'radio', 'rasgo', 'rayos', 'recto', 'reino', 'reloj',
    'renta', 'rigor', 'ritmo', 'rocas', 'rodeo', 'ronda', 'rubio', 'rueda',
    'ruido', 'rumbo', 'sabio', 'salto', 'salvo', 'santo', 'sello', 'señal',
    'serie', 'siglo', 'sitio', 'solar', 'sordo', 'suave', 'suena', 'talla',
    'tanto', 'tarde', 'techo', 'temor', 'tenso', 'tesis', 'timon', 'tinto',
    'tirar', 'torno', 'torre', 'traer', 'tramo', 'trono', 'tropa', 'turno',
    'unico', 'union', 'valor', 'vapor', 'vecin', 'vello', 'venir', 'venta',
    'verde', 'verso', 'viaje', 'viejo', 'vigor', 'volar', 'vasto', 'grasa',
    'grave', 'grito', 'guapa', 'guapo', 'heliz', 'hiena', 'hotel', 'hueco',
    'huida', 'jabon', 'jamon', 'jarra', 'junco', 'junto', 'lacra', 'lagar',
    'lanza', 'lento', 'linea', 'lista', 'llama', 'llena', 'lleno', 'lleva',
    'lonja', 'lunar', 'magia', 'magma', 'malva', 'manso', 'marco', 'matar',
    'mayor', 'medir', 'metal', 'mismo', 'mixto', 'mojon', 'morsa', 'mutis',
    'nevar', 'nombr', 'novio', 'nubes', 'opaco', 'osado', 'ovalo', 'oxido',
    'palmo', 'parar', 'pasta', 'pavor', 'perla', 'picor', 'placa', 'plato',
    'plaza', 'plomo', 'pluma', 'prado', 'presa', 'prima', 'pubis', 'pujar',
    'pulso', 'rancho', 'recta', 'ringa', 'robot', 'robar', 'sabor', 'sacar',
    'salsa', 'sangr', 'solaz', 'sonda', 'suelo', 'tabla', 'tallo', 'tapiz',
    'telar', 'tenia', 'texto', 'tiara', 'timba', 'tinca', 'tinto', 'tizne',
    'tocar', 'toldo', 'tomar', 'topes', 'toque', 'torpe', 'toxin', 'trece',
    'trigo', 'trotar', 'tumor', 'tunel', 'turba', 'ultra', 'usada', 'vagón',
    'vapor', 'vasos', 'velar', 'veloz', 'veraz', 'vocal', 'volco', 'vulto',
    'yacer', 'yegua', 'yerno', 'yodad', 'zahon', 'zambo', 'zanja', 'zarco',
    'balon', 'cesio', 'plata', 'foton', 'boton', 'moneda'
];

const VALID_WORDS_EXTRA = [
    // Palabras válidas como intento pero que no son respuesta habitual
    'acaso', 'acero', 'acido', 'acoge', 'acota', 'acude', 'acusa', 'adios',
    'agita', 'agota', 'agudo', 'ahora', 'ajena', 'ajeno', 'ajuar', 'alabo',
    'alado', 'alamo', 'alano', 'alear', 'aleja', 'alero', 'algas', 'aliso',
    'aloja', 'altos', 'amaga', 'amara', 'amasa', 'ameba', 'amiga', 'amigo',
    'amora', 'ancha', 'ancho', 'andar', 'anejo', 'anima', 'anime', 'animo',
    'ansia', 'antes', 'anuda', 'apaga', 'apela', 'apena', 'apoya', 'apura',
    'arder', 'ardid', 'ardor', 'arida', 'arido', 'arpon', 'arras', 'arrea',
    'arroz', 'artes', 'asada', 'asado', 'asear', 'asilo', 'asoma', 'aspar',
    'astro', 'ataca', 'atado', 'ataja', 'atomo', 'atona', 'atras', 'atrio',
    'avaro', 'avena', 'aviso', 'ayuda', 'azote', 'babas', 'bahia', 'balsa',
    'banda', 'baños', 'berro', 'besos', 'bidon', 'boato', 'bocas', 'bolsa',
    'bomba', 'borde', 'bordo', 'botin', 'brasa', 'bravo', 'breve', 'brisa',
    'broma', 'brote', 'bruja', 'buena', 'bueno', 'buzon', 'cabal', 'cabra',
    'cacto', 'caida', 'cajon', 'calco', 'caldo', 'calla', 'calle', 'calvo',
    'camba', 'campa', 'caras', 'carga', 'casar', 'casco', 'casto', 'cauce',
    'causa', 'cavar', 'cazar', 'celos', 'cenar', 'censo', 'cepas', 'cerca',
    'cerco', 'cesta', 'cetro', 'cifra', 'cinco', 'cisma', 'citar', 'civil',
    'claro', 'clavo', 'cocer', 'coger', 'colea', 'colmo', 'colon', 'comer',
    'copia', 'coral', 'corno', 'corto', 'costo', 'credo', 'crema', 'cruce',
    'cruel', 'cuajo', 'cubil', 'cubos', 'culpa', 'degra', 'dejar', 'denso',
    'desde', 'deseo', 'deuda', 'dieta', 'disco', 'dobla', 'dolce', 'dolor',
    'donde', 'donar', 'dosis', 'droga', 'ducha', 'dudar', 'dueño', 'duros',
    'echar', 'enero', 'envio', 'epico', 'etapa', 'etnia', 'evade', 'fabla',
    'fallo', 'falso', 'falto', 'fango', 'farsa', 'fatuo', 'favor', 'feria',
    'feroz', 'fibra', 'fiero', 'firma', 'ficha', 'flema', 'flojo', 'flujo',
    'fobia', 'fogon', 'folio', 'forja', 'fosco', 'freno', 'frian', 'frío',
    'frita', 'frito', 'fuera', 'ganan', 'garza', 'gavia', 'globo', 'glosa',
    'golfo', 'golpe', 'gorra', 'gordo', 'gotas', 'gozo', 'grabe', 'greba',
    'gruta', 'guasa', 'guija', 'guion', 'guisa', 'hadas', 'hasta', 'helar',
    'herpe', 'hilma', 'hinco', 'honra', 'hosco', 'hueco', 'huida', 'ibero',
    'idear', 'igneo', 'iluso', 'imago', 'impar', 'indio', 'istmo', 'lacra',
    'ladro', 'lapso', 'laser', 'lenta', 'letal', 'liceo', 'lidia', 'ligar',
    'limar', 'llaga', 'llora', 'loyal', 'macar', 'macro', 'magna', 'malco',
    'masca', 'masar', 'matar', 'medir', 'melco', 'meson', 'mezco', 'milpa',
    'misma', 'mocho', 'moldo', 'molla', 'molsa', 'morga', 'moton', 'nebla',
    'nocio', 'novel', 'nueza', 'oidor', 'ojear', 'omiso', 'ondas', 'orate',
    'oveja', 'pacer', 'pando', 'parca', 'parti', 'pesca', 'pilco', 'pingo',
    'piojo', 'pisca', 'plate', 'pobla', 'porco', 'porlo', 'posco', 'proa',
    'proce', 'prove', 'puedo', 'pulco', 'punzo', 'recta', 'rigor', 'ringa',
    'robot', 'robar', 'sabor', 'salsa', 'sorda', 'solaz', 'sonda', 'tabla',
    'tallo', 'tapiz', 'telar', 'tenia', 'texto', 'tiara', 'timba', 'tizne',
    'tocar', 'toldo', 'tomar', 'toque', 'torpe', 'tumor', 'tunel', 'turba',
    'usada', 'vasos', 'velar', 'veloz', 'veraz', 'yacer', 'yegua', 'yerno',
    'zanja', 'zarco',
    // Más palabras comunes
    'abaco', 'abaja', 'abate', 'abajo', 'abdom', 'abeja', 'abuso', 'acaso',
    'aceite', 'acero', 'acido', 'acoge', 'acorta', 'actor', 'adios', 'afano',
    'afina', 'aforo', 'agita', 'agita', 'agote', 'aguante', 'agua', 'agudo',
    'aires', 'ajeno', 'ajo', 'alado', 'alamo', 'albor', 'alcaz', 'alerta',
    'algo', 'algui', 'altura', 'alzar', 'amar', 'amara', 'amarga', 'amargo',
    'amasar', 'amateur', 'amenaz', 'amigo', 'amora', 'amparo', 'amplia',
    'ancho', 'andar', 'ancora', 'andro', 'aneja', 'aniño', 'anillo',
    'animar', 'anoche', 'anota', 'antes', 'anular', 'anunciar', 'apaga',
    'aparte', 'apelo', 'apena', 'aperar', 'apio', 'aplast', 'apoyo', 'aquejar',
    'arbol', 'arcos', 'ardid', 'ardo', 'arepa', 'areta', 'argo', 'arida',
    'arieles', 'arma', 'aroma', 'arroba', 'arruinar', 'asado', 'asear',
    'asfalto', 'asilo', 'asomo', 'aspa', 'aspirar', 'asta', 'astre', 'asunto',
    'atajo', 'ataque', 'atasco', 'atentado', 'aterriz', 'atizon', 'atomo',
    'atras', 'atrev', 'atributo', 'avara', 'avaro', 'avell', 'aventura', 'avión',
    'aviso', 'avivar', 'ayerno', 'ayuda', 'azado', 'azafata', 'azar', 'azote',
    'azucar', 'baba', 'abaco', 'abajo', 'abandon', 'abapor', 'abasco', 'abasto',
    'baba', 'babi', 'badal', 'bacon', 'bajar', 'bajar', 'baleo', 'ballena',
    'balon', 'balsa', 'bambito', 'banal', 'banco', 'banda', 'bandero', 'banca',
    'bando', 'banana', 'banco', 'bando', 'bano', 'bancal', 'bandola', 'bandurria',
    'banqu', 'banquete', 'banyo', 'barba', 'barca', 'barco', 'barda', 'barla',
    'barno', 'barro', 'barroco', 'bartola', 'basco', 'basico', 'basta', 'batir',
    'batuc', 'baton', 'batral', 'batuta', 'bazar', 'beber', 'beca', 'becerro',
    'bedel', 'befo', 'beige', 'beldad', 'bello', 'bendec', 'benevo', 'benigno',
    'beodo', 'beodo', 'beodo', 'beodo', 'beodo', 'beodo',
];
