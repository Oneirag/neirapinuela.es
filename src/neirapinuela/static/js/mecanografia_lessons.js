// Lesson Configuration
const lessonConfig = [
    // FASE 1: FILA BASE - MANO IZQUIERDA
    {
        title: "Fila Base 1: ASDF",
        description: "Mano izquierda - Teclas básicas",
        keys: ['a', 's', 'd', 'f'],
        words: ['a', 'a', 'a', 's', 's', 's', 'd', 'd', 'd', 'f', 'f', 'f', 'a', 's', 'd', 'f', 'a', 's', 'd', 'f', 'a', 's', 'd', 'f', 'a', 's', 'd', 'f', 'a', 's']
    },
    {
        title: "Fila Base 2: JKLÑ",
        description: "Mano derecha - Teclas básicas",
        keys: ['j', 'k', 'l', 'ñ'],
        words: ['j', 'j', 'j', 'k', 'k', 'k', 'l', 'l', 'l', 'ñ', 'ñ', 'ñ', 'j', 'k', 'l', 'ñ', 'j', 'k', 'l', 'ñ', 'j', 'k', 'l', 'ñ', 'j', 'k', 'l', 'ñ', 'j', 'k']
    },
    {
        title: "Fila Base 3: GH",
        description: "Índices - Teclas centrales",
        keys: ['g', 'h'],
        words: ['g', 'g', 'g', 'h', 'h', 'h', 'g', 'h', 'g', 'h', 'g', 'h', 'g', 'h', 'g', 'h', 'g', 'h', 'g', 'h', 'g', 'h', 'g', 'h', 'g', 'h', 'g', 'h', 'g', 'h']
    },
    {
        title: "Fila Base 4: Combinaciones",
        description: "Todas las teclas de la fila base",
        keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
        words: ['as', 'la', 'ha', 'al', 'da', 'fa', 'ja', 'ka', 'ga', 'ña', 'ad', 'sd', 'fd', 'gd', 'hd', 'jd', 'kd', 'ld', 'ag', 'sg', 'dg', 'fg', 'ah', 'sh', 'dh', 'fh', 'gh', 'jh', 'kh', 'lh',
                'ñajf', 'jksd', 'jaskjf', 'ghfjdkslañ', 'ghañslfjkd', 'lksdafghljkñ'
        ]
    },
    {
        title: "Fila Base 5: Palabras",
        description: "Todas las teclas de la fila base",
        keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
        words: [
            'ñas', 'laja', 'hada', 'lada', 'alada', 'jala', 'alhaja', 'gafa', 'gafada', 'hallada', 'añada', 'dañada', 'gas', 'faja', 'fajada', 'gafada',
            'ñas', 'laja', 'hada', 'lada', 'alada', 'jala', 'alhaja', 'gafa', 'gafada', 'hallada', 'añada', 'dañada', 'gas', 'faja', 'fajada', 'gafada', 
        ]
    },


    // FASE 2: FILA SUPERIOR - MANO IZQUIERDA
{
        title: "Fila Superior 1: QA",
        description: "Meñique mano izquierda - Fila superior y central",
        keys: ['q', 'a'],
        words: [
            'qa', 'aq', 'aqa', 'qaqa', 'aaaa', 'qqqq',
            'qaqaqa', 'aaqqaa', 'aaaqqqaaa', 'qaqa', 
            'qaq', 'aqqa', 'qqaa', 'aaaaa', 'qqqqq',
            'qaqaq', 'aqqaq', 'qaqaqaq', 'aaqqaaqq',
            'qaqaaaq', 'qaqqq', 'aqqaqq', 'qaaqa',
            'qaqqaa', 'aqqaqa', 'aaaaqqq', 'qqqaqa',
            'aqaaaq', 'qaqaa', 'qqaaa', 'aqaqq',
            'qaqqa', 'qaaqq', 'aaaqaqa', 'qqqaq',
            'qaqaqaqa', 'aqaaaaq', 'qaqaqqqq', 'qqqaqqq',
            'aaaqqqa', 'qaaaaqq', 'qqqaqa', 'aqaqqa'
        ]
    },
    {
        title: "Fila Superior 2: WS",
        description: "Anular mano izquierda - Fila superior y central",
        keys: ['w', 's'],
        words: [
            'ws', 'sw', 'wsw', 'sws', 'wwww', 'ssss',
            'wswsws', 'sswwss', 'ssswwwsss', 'wswsw',
            'wssw', 'swsws', 'wwssww', 'ssssww', 
            'wwwssw', 'sssws', 'swswws', 'wssss',
            'wsws', 'swsw', 'wswsww', 'swwsss',
            'wwswws', 'sswws', 'wswws', 'swssw',
            'wsswww', 'sswwssw', 'wwsssw', 'sswssw'
        ]
    },
    {
        title: "Fila Superior 3: ED",
        description: "Corazón mano izquierda - Fila superior y central",
        keys: ['e', 'd'],
        words: [
            'ed', 'de', 'eded', 'dede', 'eeee', 'dddd',
            'ededede', 'ddededd', 'eeeedddd', 'eded',
            'edde', 'deed', 'eeedd', 'ddddde', 
            'edeede', 'deeddd', 'eddede', 'ddeed',
            'eddeded', 'deeded', 'edede', 'deeeds',
            'eddeed', 'dededd', 'eededde', 'dddee'
        ]
    },

        {
        title: "Fila Superior 4: FRGT",
        description: "Índice mano izquierda - Filas Superior y Central",
        keys: ['f', 'r', 'g', 't'],
        words: [
            'fr', 'rf', 'gt', 'tg', 'frg', 'rgt',
            'fgt', 'trf', 'frft', 'rtgf', 'grtf',
            'tgrf', 'fgtr', 'rftg', 'tgfr', 
            'frfr', 'rgtr', 'gtgt', 'tgfg', 
            'frfg', 'rtgf', 'grfg', 'tgrf', 
            'frgt', 'rfgt', 'gtgtg', 'tgtgt',
            'frftg', 'rfgtr', 'gtgrt', 'tgtfr'
        ]
    },
    {
        title: "Fila Superior 5: QWERT",
        description: "Mano izquierda - Fila superior",
        keys: ['q', 'w', 'e', 'r', 't'],
        words: ['q', 'q', 'w', 'w', 'e', 'e', 'r', 'r', 't', 't', 'qw', 'we', 'er', 'rt', 'qe', 'wr', 'et', 'qr', 'wt', 'qt', 'qwer', 'wert', 'qwert', 'eq', 'rw', 'te', 'tr', 'ew', 'rq', 'tw']
    },

    {
        title: "Combinación ASDF y QWERT",
        description: "Mano izquierda - Fila superior y central",
        keys: ['a', 's', 'd', 'f', 'q', 'w', 'e', 'r', 't'],
        words: [
            'as', 'sd', 'df', 'fa', 'qw', 'we', 
            'er', 'rq', 'asd', 'dsf', 'fqaw',
            'werq', 'asdf', 'qwerty', 'saqr',
            'dfeaw', 'rqwd', 'afweq', 'sdrw',
            'fdasr', 'qwesd', 'rafsd', 'wsqe',
            'edfaw', 'qwer', 'fasd', 'wrqa',
            'dsaqe', 'frwe', 'qwfr', 'aesd',
            'reta', 'seta', 'tate', 'date', 
            'tea', 'seda', 'tera', 'estera', 
            'festera', 'esfera', 'redada', 'sedada', 
            'fresa', 'fresada', 'sastre', 
        ]
    },

    {
        title: "Fila Superior 6: ÑP",
        description: "Meñique Derecho - Filas Superior y Central",
        keys: ['ñ', 'p'],
        words: [
            'ñp', 'pñ', 'ññp', 'pññ', 'ññññ', 'pppp',
            'ñpñp', 'ppññ', 'ñññp', 'pñpp', 
            'ñpññ', 'pñnp', 'ñpññp', 'pñññp',
            'ññññ', 'ppppñ', 'ñpñññ', 'pñpññ',
            'ñpñpp', 'pñnpñ', 'ññpññ', 'pññññ'
        ]
    },
{
        title: "Fila Superior 7: OL",
        description: "Anular Derecho - Filas Superior y Central",
        keys: ['o', 'l'],
        words: [
            'ol', 'lo', 'oll', 'lol', 'oooo', 'llll',
            'ollo', 'lloo', 'olll', 'lool', 
            'ollp', 'lpoo', 'ollop', 'lplol',
            'oolll', 'llloo', 'ollloo', 'polol',
            'olloo', 'lploo', 'ololo', 'lllol'
        ]
    },
        {
        title: "Fila Superior 8: IK",
        description: "Corazón Derecho - Filas Superior y Central",
        keys: ['i', 'k'],
        words: [
            'ik', 'ki', 'ikk', 'kii', 'iii', 'kkkk',
            'iki', 'kii', 'ikki', 'kik', 
            'ikp', 'kipk', 'ikki', 'kpik',
            'iikk', 'kkii', 'ikki', 'pkik',
            'ikii', 'kpii', 'ikko', 'kkil'
        ]
    },
        {
        title: "Fila Superior 9: UYHJ",
        description: "Índice Derecho - Filas Superior y Central",
        keys: ['u', 'y', 'h', 'j'],
        words: [
            'uy', 'yu', 'uuh', 'hyu', 'uuu', 'yyyy',
            'uj', 'ju', 'ujj', 'juy', 
            'uyh', 'hyu', 'uyjh', 'juyh',
            'uuuh', 'yyyu', 'uyyhu', 'pyuy',
            'uyyu', 'hyuu', 'uyjj', 'yyju'
        ]
    },

    {
        title: "Fila Superior 10: YUIOP",
        description: "Mano derecha - Fila superior",
        keys: ['y', 'u', 'i', 'o', 'p'],
        words: ['y', 'y', 'u', 'u', 'i', 'i', 'o', 'o', 'p', 'p', 'yu', 'ui', 'io', 'op', 'yi', 'uo', 'ip', 'yo', 'up', 'yp', 'yuio', 'uiop', 'yuiop', 'iy', 'ou', 'pi', 'po', 'iu', 'oy', 'py']
    },
    {
        title: "Fila Superior 11: YUIOPHJKLÑ",
        description: "Mano derecha - Fila superior",
        keys: ['y', 'u', 'i', 'o', 'p' , 'h', 'j', 'k', 'l', 'ñ'],
        words: [
            'pollo', 'lollo', 'kilo', 'julio', 'hilo', 'yolo', 'puño', 'piño', 'puy', 'hui', 'pulo', 'lupulo', 'pulio',
            'pollo', 'lollo', 'kilo', 'julio', 'hilo', 'yolo', 'puño', 'piño', 'puy', 'hui', 'pulo', 'lupulo', 'pulio'
        ]
    },
    {
        title: "Fila Superior 12: Mezcla Sup+Base",
        description: "Combina fila superior con base",
        keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
        words: ['que', 'uso', 'peso', 'rey', 'tipo', 'país', 'queso', 'hueso', 'frase', 'pasta', 'lago', 'tarde', 'donde', 'poder', 'reyes', 'usada', 'pesar', 'grados', 'puerta', 'quitar',
            'piñado', 'perlado', 'dopado', 'pedido', 'hielo', 'gordo', 'sordo', 'ñordo', 'fiordo', 'heder', 'querido', 'quisiera',
            'huerto', 'huerta', 'huelga', 'pulidas', 'perdidas', 'jalado', 'yate', 'yogur', 'yogurt', 'relato',
            'helado', 'tulipas'
        ]
    },

    
    // FASE 3: FILA INFERIOR - MANO IZQUIERDA
        {
        title: "Fila Inferior 1: AZ",
        description: "Meñique Izquierdo - Fila Inferior",
        keys: ['a', 'z'],
        words: [
            'az', 'za', 'aza', 'zaz', 'aaaa', 'zzzz',
            'azazaz', 'aaaazzaa', 'aaaaazzzz', 'azaz',
            'aza', 'zaa', 'aaaz', 'zzzz',
            'azaza', 'zaza', 'aaaazz', 'zzaaaz',
            'azazaza', 'zazazaz', 'azaaaa', 'zzzzaa',
            'zaazza', 'azazza', 'aaazza', 'zzaaz'
        ]
    },
    {
    title: "Fila Inferior 2: SX",
    description: "Anular Izquierdo - Fila Inferior",
    keys: ['s', 'x'],
    words: [
        'sx', 'xs', 'ssx', 'xss', 'ssss', 'xxxx',
        'sxsxsx', 'sssssxxsss', 'ssssxsssxxx', 'sxsx',
        'ssx', 'xss', 'sssxs', 'xxxx',
        'sxssx', 'xsxs', 'ssssx', 'xxssx',
        'sxssxs', 'xsxsxs', 'ssxsxx', 'xxssss'
    ]
},
{
    title: "Fila Inferior 3: DC",
    description: "Corazón Izquierdo - Fila Inferior",
    keys: ['d', 'c'],
    words: [
        'dc', 'cd', 'ddc', 'cdd', 'dddd', 'cccc',
        'dcdcdd', 'dddcccddd', 'ddddccccc', 'dcdc',
        'ddd', 'ccd', 'dddc', 'cccc',
        'dcdcd', 'cdc', 'ddddc', 'cccdc',
        'dcdcdd', 'cdcdc', 'dddc', 'cccc'
    ]
},
{
    title: "Fila Inferior 4: FGVB",
    description: "Índice Izquierdo - Fila Inferior",
    keys: ['f', 'g', 'v', 'b'],
    words: [
        'fg', 'gf', 'ffg', 'ggf', 'ffff', 'gggg',
        'fv', 'vf', 'vvf', 'fvf', 
        'fb', 'bf', 'bbf', 'fbf', 
        'fgv', 'gvf', 'fgvb', 'bgvf',
        'fgb', 'gbf', 'ffvg', 'ggbv',
        'fgfg', 'gfg', 'ffffg', 'gggg',
        'fvbf', 'vfbg', 'ffvbb', 'ggfbb'
    ]
},
    {
        title: "Fila Inferior 5: ZXCV",
        description: "Mano izquierda - Fila inferior",
        keys: ['z', 'x', 'c', 'v'],
        words: ['z', 'z', 'x', 'x', 'c', 'c', 'v', 'v', 'zx', 'xc', 'cv', 'zc', 'xv', 'zv', 'zxc', 'xcv', 'zxcv', 'cz', 'vx', 'vc', 'vz', 'cx', 'xz', 'czx', 'vcx', 'vzx']
    },

{
    title: "Fila Inferior 6: ASDFGZXCV",
    description: "Mano Izquierda - Fila Inferior y central",
    keys: ['a', 's', 'd', 'f', 'g', 'z', 'x', 'c', 'v'],
    words: [
        'asd', 'dsa', 'asdg', 'gsda', 'aaassddff',
        'azxc', 'czxa', 'zzxxcc', 'azzxc',
        'sgdf', 'fdsxg', 'sfgdxc', 'xdfsg',
        'agfv', 'vga', 'aggfva', 'vgaf',
        'asdgz', 'zgsda', 'asdazgf', 'gfzasd',
        'aszcxv', 'vcxzsa', 'asazzxcv', 'cvxzas',
        'adgsvxzc', 'czxvsdag', 'asdfgzxc', 'xcvfsga',
        'casca', 'zasca', 'caca', 'casaca', 'faz', 'cazada',
        'dax'
    ]
},

{
    title: "Fila Inferior 7: KM",
    description: "Corazón Derecho - Fila Inferior",
    keys: ['k', 'm'],
    words: [
        'km', 'mk', 'kkm', 'mmk', 'kkkk', 'mmmm',
        'kkmk', 'mmmkkk', 'kkkmmmm', 'kkm',
        'kkm', 'mkk', 'kkmk', 'mmmm',
        'kmmk', 'mkkm', 'kkkm', 'mmkk',
        'kkmkm', 'mkkmk', 'kkmmm', 'mmkkm'
    ]
},
{
    title: "Fila Inferior 8: JHBN",
    description: "Índice Derecho - Fila Inferior",
    keys: ['j', 'h', 'b', 'n'],
    words: [
        'jh', 'hj', 'jjh', 'hhj', 'jjjj', 'hhhh',
        'jb', 'bj', 'bbj', 'jbj', 
        'jn', 'nj', 'nnj', 'jnj', 
        'jhb', 'bhj', 'jhbn', 'nbhj',
        'jhn', 'nhj', 'jjhn', 'hhbn',
        'jhhb', 'bhj', 'jjhbb', 'hhbhn',
        'jhbjn', 'njbh', 'jjhhbn', 'hhnbj'
    ]
},

    {
        title: "Fila Inferior 9: BNM",
        description: "Mano derecha - Fila inferior",
        keys: ['b', 'n', 'm'],
        words: ['b', 'b', 'n', 'n', 'm', 'm', 'bn', 'nm', 'bm', 'nb', 'mn', 'mb', 'bnm', 'nmb', 'mnb', 'bmn', 'nbm', 'mbn', 'bn', 'nm', 'bm', 'nb', 'mn', 'mb', 'bnm', 'nmb', 'mnb', 'bmn', 'nbm', 'mbn']
    },


    {
        title: "Todas las filas 1",
        description: "Superior + Base + Inferior",
        keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ', 'z', 'x', 'c', 'v', 'b', 'n', 'm'],
        words: ['mesa', 'vida', 'coma', 'zinc', 'vaca', 'boca', 'nube', 'zona', 'campo', 'vez', 'con', 'van', 'bien', 'nueva', 'mano', 'cinco', 'cambio', 'nombre', 'cebra', 'banco']
    },
    
    // FASE 4: PALABRAS SIMPLES
    {
        title: "Palabras 1: Dos letras",
        description: "Palabras de 2 letras",
        keys: [],
        words: ['la', 'el', 'en', 'es', 'un', 'se', 'no', 'te', 'lo', 'le', 'da', 'su', 'tu', 'mi', 'me', 'si', 'ya', 'he', 'ha', 'al', 'de', 'or', 'ir', 'os', 'as', 'oh', 'yo', 'va', 've', 'vi']
    },
    {
        title: "Palabras 2: Tres letras",
        description: "Palabras de 3 letras",
        keys: [],
        words: ['que', 'con', 'una', 'por', 'son', 'las', 'del', 'los', 'ese', 'más', 'sus', 'muy', 'vez', 'día', 'año', 'dos', 'así', 'hoy', 'fue', 'paz', 'luz', 'fin', 'red', 'mar', 'sol', 'pan', 'gol', 'rey', 'ley', 'top']
    },
    {
        title: "Palabras 3: Cuatro letras",
        description: "Palabras de 4 letras",
        keys: [],
        words: ['casa', 'vida', 'mesa', 'agua', 'hijo', 'pasa', 'peso', 'boca', 'mano', 'cosa', 'tema', 'hora', 'zona', 'tipo', 'dato', 'este', 'otro', 'lado', 'modo', 'alto', 'bajo', 'poco', 'todo', 'solo', 'cada', 'algo', 'nada', 'obra', 'forma', 'idea']
    },
    
    // FASE 5: NÚMEROS Y SÍMBOLOS
    {
        title: "Números 1: 1-5",
        description: "Números con mano izquierda",
        keys: ['1', '2', '3', '4', '5'],
        words: ['1', '2', '3', '4', '5', '12', '23', '34', '45', '123', '234', '345', '1234', '2345', '12345', '15', '24', '35', '14', '25', '13', '124', '135', '145', '235', '1235', '1245', '1345', '2345', '12345']
    },
    {
        title: "Números 2: 6-0",
        description: "Números con mano derecha",
        keys: ['6', '7', '8', '9', '0'],
        words: ['6', '7', '8', '9', '0', '67', '78', '89', '90', '678', '789', '890', '6789', '7890', '67890', '60', '79', '80', '69', '70', '68', '679', '680', '690', '780', '6780', '6790', '6890', '7890', '67890']
    },
    {
        title: "Números 3: Todos",
        description: "Todos los números",
        keys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
        words: ['10', '20', '30', '100', '365', '2024', '1975', '12', '24', '60', '90', '45', '67', '89', '123', '456', '789', '1000', '2000', '2010', '2015', '2020', '2025', '1234', '5678', '9012', '3456', '7890', '1357', '2468']
    },
    
    // FASE 6: SÍMBOLOS
    {
        title: "Símbolos 1: Básicos",
        description: "Puntuación básica",
        keys: ['.', ',', ';', ':'],
        words: ['hola.', 'bien,', 'casa;', 'agua:', 'final.', 'lista,', 'punto;', 'hora:', 'texto.', 'frase,', 'dato;', 'tema:', 'idea.', 'cosa,', 'modo;', 'tipo:', 'vida.', 'mesa,', 'zona;', 'peso:']
    },
    {
        title: "Símbolos 2: Interrogación",
        description: "Signos de interrogación",
        keys: ['?', '¿', '!', '¡'],
        words: ['¿qué?', '¡bien!', '¿cómo?', '¡hola!', '¿dónde?', '¡perfecto!', '¿cuándo?', '¡genial!', '¿quién?', '¡excelente!', '¿por qué?', '¡increíble!', '¿verdad?', '¡fantástico!', '¿seguro?', '¡maravilloso!', '¿cierto?', '¡estupendo!', '¿entonces?', '¡magnífico!']
    },
    
    // FASE 7: PALABRAS COMPLEJAS
    {
        title: "Palabras Complejas 1",
        description: "Palabras largas frecuentes",
        keys: [],
        words: ['teclado', 'escribir', 'rápido', 'lento', 'práctica', 'dedos', 'manos', 'lección', 'perfecto', 'velocidad', 'precisión', 'mecanografía', 'entrenamiento', 'habilidad', 'coordinación', 'ejercicio', 'repetición', 'constancia', 'mejora', 'progreso']
    },
    {
        title: "Palabras Españolas",
        description: "Palabras con ñ y acentos",
        keys: ['ñ', 'á', 'é', 'í', 'ó', 'ú'],
        words: ['niño', 'año', 'mañana', 'español', 'señor', 'pequeño', 'sueño', 'baño', 'montaña', 'otoño', 'más', 'está', 'será', 'mamá', 'papá', 'café', 'médico', 'teléfono', 'bebé', 'después', 'fácil', 'difícil', 'música', 'película', 'día', 'corazón', 'canción', 'atención', 'nación', 'educación']
    },
    
    // FASE 8: ORACIONES
    {
        title: "Oraciones Simples",
        description: "Frases cortas",
        keys: [],
        words: ['La casa es grande.', 'El agua está fría.', 'Mi hijo come pan.', 'Tu mesa es nueva.', 'Esta vida es buena.', 'Cada día es único.', 'Todo pasa rápido.', 'Algo bueno viene.', 'Nada es perfecto.', 'Solo práctica ayuda.']
    },
    {
        title: "Oraciones Complejas",
        description: "Frases largas",
        keys: [],
        words: ['La práctica hace al maestro.', 'Escribir rápido es muy útil.', 'Usa todos los dedos correctamente.', 'La velocidad viene con el tiempo.', 'Pablo y Carlitos practican mucho.', 'La familia es muy importante.', 'Cada día es una nueva oportunidad.', 'El esfuerzo siempre da buenos resultados.', 'La paciencia es la clave del éxito.', 'Siempre se puede mejorar más.']
    },
    
    // FASE 9: NIVEL AVANZADO
    {
        title: "Tecnología",
        description: "Vocabulario técnico",
        keys: [],
        words: ['programación', 'javascript', 'desarrollo', 'tecnología', 'algoritmo', 'framework', 'aplicación', 'ordenador', 'internet', 'navegador', 'base de datos', 'sistema', 'software', 'hardware', 'red', 'servidor', 'cliente', 'protocolo', 'interfaz', 'usuario', 'diseño', 'arquitectura', 'optimización']
    },
    {
        title: "Nivel Maestro",
        description: "Desafío final",
        keys: [],
        words: ['felicitaciones', 'extraordinario', 'logro', 'fenomenal', 'sobresaliente', 'magnífico', 'excelente', 'impresionante', 'espectacular', 'increíble', 'maravilloso', 'excepcional', 'fantástico', 'admirable', 'notable', 'sensacional', 'formidable', 'estupendo', 'brillante', 'genial', 'perfeccionamiento', 'profesional', 'especialización', 'competencia']
    }
];
