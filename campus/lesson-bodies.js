const NOTES = {
  es: {
    yes: "Esta lección de apertura está en español. Las demás lecciones del campus siguen en inglés.",
    no: "El cuerpo de esta lección está en inglés.",
  },
  fr: {
    yes: "Cette leçon d'ouverture est en français. Les autres leçons du campus restent en anglais.",
    no: "Le corps de cette leçon est en anglais.",
  },
  de: {
    yes: "Diese erste Lektion ist auf Deutsch. Die übrigen Lektionen bleiben auf Englisch.",
    no: "Der Lektionstext ist auf Englisch.",
  },
  ja: {
    yes: "この導入レッスンは日本語です。ほかのレッスン本文は英語のままです。",
    no: "このレッスン本文は英語です。",
  },
  hi: {
    yes: "यह शुरुआती पाठ हिन्दी में है। बाकी पाठ अंग्रेज़ी में रहते हैं।",
    no: "इस पाठ का मुख्य भाग अंग्रेज़ी में है।",
  },
  te: {
    yes: "ఈ మొదటి పాఠం తెలుగులో ఉంది. మిగిలిన పాఠాలు ఇంగ్లీషులోనే ఉంటాయి.",
    no: "ఈ పాఠం యొక్క విషయం ఇంగ్లీషులో ఉంది.",
  },
  ar: {
    yes: "هذا الدرس الافتتاحي بالعربية. بقية الدروس تبقى بالإنجليزية.",
    no: "متن هذا الدرس بالإنجليزية.",
  },
};

const BODIES = {};

function put(id, packs) {
  BODIES[id] = packs;
}

put("foundations-why", {
  es: {
    why: "No puedes depurar un centro de contacto si tratas AWS como un logo en la factura.",
    paras: [
      "Amazon Connect, llamado Amazon Connect Customer en la guía de administración tras el anuncio de familia del 28 de abril de 2026, es un centro de contacto multiinquilino en una región que eliges. La instancia no contiene IAM, S3, Lambda, Kinesis ni CloudWatch. Los llama.",
      "Este campus empieza aquí porque cada fallo posterior cae en uno de esos servicios: una política de clave, un grupo de logs, un shard de stream, un endpoint regional o un firewall.",
    ],
    points: [
      "El nombre de familia Amazon Connect cubre ahora Customer, Health, Decisions y Talent. Este campus enseña el centro de contacto.",
      "Los prefijos IAM que verás incluyen connect, profile, cases, wisdom y voiceid. voiceid es histórico después del 20 de mayo de 2026.",
      "El plano de datos de los agentes es el navegador, no una imagen de firmware de PBX.",
      "Responsabilidad compartida: AWS opera la plataforma. Tú operas flujos, identidad, claves, números, cuotas y la red del agente.",
    ],
    mistake: "Empezar en el diseñador de flujos antes de poder nombrar la región y la cuenta.",
  },
  fr: {
    why: "On ne dépanne pas un centre de contact en traitant AWS comme un logo sur la facture.",
    paras: [
      "Amazon Connect, nommé Amazon Connect Customer dans le guide d'administration après l'annonce de famille du 28 avril 2026, est un centre de contact mutualisé dans une région que vous choisissez. L'instance ne contient pas IAM, S3, Lambda, Kinesis ni CloudWatch. Elle les appelle.",
      "Ce campus commence ici parce que chaque panne suivante tombe dans l'un de ces services : une politique de clé, un groupe de journaux, un shard de flux, un point de terminaison régional ou un pare-feu.",
    ],
    points: [
      "Le nom de famille Amazon Connect couvre maintenant Customer, Health, Decisions et Talent. Ce campus enseigne le centre de contact.",
      "Les préfixes IAM que vous croiserez incluent connect, profile, cases, wisdom et voiceid. voiceid est historique après le 20 mai 2026.",
      "Le plan de données des agents est le navigateur, pas une image de firmware de PBX.",
      "Responsabilité partagée : AWS exploite la plateforme. Vous exploitez les flux, l'identité, les clés, les numéros, les quotas et le réseau de l'agent.",
    ],
    mistake: "Ouvrir le concepteur de flux avant de pouvoir nommer la région et le compte.",
  },
  de: {
    why: "Ein Contact Center lässt sich nicht debuggen, wenn AWS nur ein Logo auf der Rechnung ist.",
    paras: [
      "Amazon Connect, im Admin-Handbuch nach der Familienankündigung vom 28. April 2026 Amazon Connect Customer genannt, ist ein Mehrmandanten-Contact-Center in einer Region, die Sie wählen. Die Instanz enthält IAM, S3, Lambda, Kinesis und CloudWatch nicht. Sie ruft sie auf.",
      "Dieser Campus beginnt hier, weil jeder spätere Fehler in einem dieser Dienste landet: einer Schlüsselrichtlinie, einer Protokollgruppe, einem Stream-Shard, einem regionalen Endpunkt oder einer Firewall.",
    ],
    points: [
      "Der Familienname Amazon Connect umfasst jetzt Customer, Health, Decisions und Talent. Dieser Campus lehrt das Contact Center.",
      "IAM-Präfixe, denen Sie begegnen, sind connect, profile, cases, wisdom und voiceid. voiceid ist nach dem 20. Mai 2026 historisch.",
      "Die Datenebene der Agenten ist der Browser, kein PBX-Firmware-Image.",
      "Geteilte Verantwortung: AWS betreibt die Plattform. Sie betreiben Flows, Identität, Schlüssel, Nummern, Kontingente und das Agentennetz.",
    ],
    mistake: "Im Flow-Designer anfangen, bevor Region und Konto benannt sind.",
  },
  ja: {
    why: "請求書のロゴとして AWS を扱うと、コンタクトセンターはデバッグできません。",
    paras: [
      "Amazon Connect は、2026年4月28日のファミリー発表以降、管理ガイドでは Amazon Connect Customer と呼ばれます。選んだリージョンにあるマルチテナントのコンタクトセンターです。インスタンスの中に IAM、S3、Lambda、Kinesis、CloudWatch はありません。それらを呼び出します。",
      "このキャンパスがここから始まるのは、その後の障害がどれもそれらのサービスに落ちるからです。キーポリシー、ロググループ、ストリームのシャード、リージョンのエンドポイント、またはファイアウォールです。",
    ],
    points: [
      "ファミリー名 Amazon Connect は今、Customer、Health、Decisions、Talent を含みます。このキャンパスが教えるのはコンタクトセンターです。",
      "出会う IAM プレフィックスには connect、profile、cases、wisdom、voiceid があります。voiceid は 2026年5月20日以降は過去のものです。",
      "エージェントのデータプレーンはブラウザであり、PBX のファームウェアイメージではありません。",
      "責任共有: プラットフォームは AWS が動かす。フロー、ID、キー、番号、クォータ、エージェントのネットワークはあなたが動かす。",
    ],
    mistake: "リージョンとアカウントを言える前にフローデザイナーから始めること。",
  },
  hi: {
    why: "यदि AWS को केवल बिल पर एक लोगो मानें, तो संपर्क केंद्र को डीबग नहीं कर सकते।",
    paras: [
      "Amazon Connect, 28 अप्रैल 2026 की परिवार घोषणा के बाद व्यवस्थापक गाइड में Amazon Connect Customer कहलाता है, आपके चुने क्षेत्र में एक बहु-किरायेदार संपर्क केंद्र है। इंस्टेंस के अंदर IAM, S3, Lambda, Kinesis या CloudWatch नहीं होते। वह उन्हें कॉल करता है।",
      "यह कैंपस यहीं से शुरू होता है क्योंकि बाद की हर गड़बड़ी इन्हीं सेवाओं में गिरती है: एक कुंजी नीति, एक लॉग समूह, एक स्ट्रीम शार्ड, एक क्षेत्रीय एंडपॉइंट, या एक फ़ायरवॉल।",
    ],
    points: [
      "परिवार नाम Amazon Connect अब Customer, Health, Decisions और Talent को ढकता है। यह कैंपस संपर्क केंद्र सिखाता है।",
      "जो IAM उपसर्ग मिलेंगे उनमें connect, profile, cases, wisdom और voiceid हैं। 20 मई 2026 के बाद voiceid ऐतिहासिक है।",
      "एजेंट का डेटा प्लेन ब्राउज़र है, PBX फ़र्मवेयर छवि नहीं।",
      "साझा ज़िम्मेदारी: प्लेटफ़ॉर्म AWS चलाता है। फ़्लो, पहचान, कुंजियाँ, नंबर, कोटा और एजेंट नेटवर्क आप चलाते हैं।",
    ],
    mistake: "क्षेत्र और खाते का नाम लिए बिना फ़्लो डिज़ाइनर से शुरू करना।",
  },
  te: {
    why: "AWS ను బిల్లు మీద లోగోగా చూస్తే కాంటాక్ట్ సెంటర్‌ను డీబగ్ చేయలేరు.",
    paras: [
      "Amazon Connect, 28 ఏప్రిల్ 2026 కుటుంబ ప్రకటన తర్వాత అడ్మిన్ గైడ్‌లో Amazon Connect Customer అని పిలవబడుతుంది. మీరు ఎంచుకున్న రీజియన్‌లో బహుళ అద్దెదారుల కాంటాక్ట్ సెంటర్. ఇన్‌స్టాన్స్ లోపల IAM, S3, Lambda, Kinesis, CloudWatch లేవు. అది వాటిని పిలుస్తుంది.",
      "ఈ క్యాంపస్ ఇక్కడ మొదలవుతుంది ఎందుకంటే తర్వాతి ప్రతి లోపం ఆ సేవల్లో ఒకదానిలో పడుతుంది: కీ పాలసీ, లాగ్ గ్రూప్, స్ట్రీమ్ షార్డ్, రీజినల్ ఎండ్‌పాయింట్, లేదా ఫైర్‌వాల్.",
    ],
    points: [
      "కుటుంబ పేరు Amazon Connect ఇప్పుడు Customer, Health, Decisions, Talent ను కవర్ చేస్తుంది. ఈ క్యాంపస్ కాంటాక్ట్ సెంటర్ నేర్పుతుంది.",
      "మీరు కలిసే IAM ప్రిఫిక్స్‌లలో connect, profile, cases, wisdom, voiceid ఉన్నాయి. 20 మే 2026 తర్వాత voiceid చారిత్రకం.",
      "ఏజెంట్ డేటా ప్లేన్ బ్రౌజర్, PBX ఫర్మ్‌వేర్ ఇమేజ్ కాదు.",
      "పంచుకున్న బాధ్యత: ప్లాట్‌ఫామ్ AWS నడుపుతుంది. ఫ్లోలు, గుర్తింపు, కీలు, నంబర్లు, కోటాలు, ఏజెంట్ నెట్‌వర్క్ మీరు నడుపుతారు.",
    ],
    mistake: "రీజియన్ మరియు ఖాతా పేరు చెప్పగలిగే ముందు ఫ్లో డిజైనర్‌లో మొదలుపెట్టడం.",
  },
  ar: {
    why: "لا يمكن تصحيح مركز اتصال إذا عوملت AWS كشعار على الفاتورة.",
    paras: [
      "Amazon Connect، ويسمّى Amazon Connect Customer في دليل الإدارة بعد إعلان العائلة في 28 أبريل 2026، مركز اتصال متعدد المستأجرين في منطقة تختارها. المثيل لا يحتوي IAM ولا S3 ولا Lambda ولا Kinesis ولا CloudWatch. هو يستدعيها.",
      "يبدأ هذا الحرم من هنا لأن كل عطل لاحق يقع في إحدى تلك الخدمات: سياسة مفتاح، أو مجموعة سجلات، أو جزء من مجرى، أو نقطة نهاية إقليمية، أو جدار حماية.",
    ],
    points: [
      "اسم العائلة Amazon Connect يغطي الآن Customer وHealth وDecisions وTalent. هذا الحرم يعلّم مركز الاتصال.",
      "بادئات IAM التي ستقابلها تشمل connect وprofile وcases وwisdom وvoiceid. voiceid تاريخي بعد 20 مايو 2026.",
      "مستوى بيانات الوكيل هو المتصفح، لا صورة برنامج ثابت لمقسم.",
      "مسؤولية مشتركة: AWS تشغّل المنصة. أنت تشغّل التدفقات والهوية والمفاتيح والأرقام والحصص وشبكة الوكيل.",
    ],
    mistake: "البدء في مصمم التدفق قبل أن تستطيع تسمية المنطقة والحساب.",
  },
});

put("instance-create", {
  es: {
    why: "La instancia es el límite de tenencia de usuarios, flujos y números. Una segunda instancia accidental parte los informes y la identidad.",
    paras: [
      "Al crearla eliges la identidad: usuarios guardados en Connect o SAML 2.0. Eliges si la instancia hace y recibe llamadas, y dónde van las grabaciones y los informes. Cambiar la identidad después es un proyecto, no un interruptor.",
      "La URL de administración y el CCP viven en el alias de la instancia bajo my.connect.aws. Anota el alias. Los firewalls y las URL ACS de SAML dependen de él.",
    ],
    points: [
      "Llamadas concurrentes por defecto: 10. Pide más antes de un piloto mayor que un equipo.",
      "Las opciones de almacenamiento se pueden actualizar, pero los objetos que ya existen no se mudan solos.",
      "Dos instancias por región es la cuota inicial.",
      "CloudTrail registra las llamadas del plano de control. Se activa en la cuenta, no dentro del flujo.",
    ],
    mistake: "Crear una instancia de producción en la región equivocada porque la consola se abrió allí.",
  },
  fr: {
    why: "L'instance est la frontière de location pour les utilisateurs, les flux et les numéros. Une seconde instance accidentelle sépare les rapports et l'identité.",
    paras: [
      "À la création vous choisissez l'identité : utilisateurs stockés dans Connect ou SAML 2.0. Vous choisissez si l'instance émet et reçoit des appels, et où vont les enregistrements et les rapports. Changer l'identité ensuite est un projet, pas un interrupteur.",
      "L'URL d'administration et le CCP vivent sur l'alias de l'instance sous my.connect.aws. Notez l'alias. Les pare-feu et les URL ACS SAML en dépendent.",
    ],
    points: [
      "Appels simultanés par défaut : 10. Demandez plus avant un pilote plus grand qu'une équipe.",
      "Les choix de stockage peuvent être mis à jour, mais les objets déjà là ne se déplacent pas seuls.",
      "Deux instances par région est le quota de départ.",
      "CloudTrail enregistre les appels du plan de contrôle. Activez-le dans le compte, pas dans le flux.",
    ],
    mistake: "Créer une instance de production dans la mauvaise région parce que la console s'y est ouverte.",
  },
  de: {
    why: "Die Instanz ist die Mandantengrenze für Benutzer, Flows und Nummern. Eine versehentliche zweite Instanz teilt Berichte und Identität.",
    paras: [
      "Bei der Erstellung wählen Sie die Identität: in Connect gespeicherte Benutzer oder SAML 2.0. Sie wählen, ob die Instanz anruft und angerufen wird, und wohin Aufzeichnungen und Berichte gehen. Die Identität später zu ändern ist ein Projekt, kein Schalter.",
      "Die Admin-URL und der CCP liegen auf dem Instanzalias unter my.connect.aws. Schreiben Sie den Alias auf. Firewalls und SAML-ACS-URLs hängen davon ab.",
    ],
    points: [
      "Gleichzeitige Anrufe, Standard: 10. Mehr beantragen, bevor ein Pilot größer als ein Team wird.",
      "Speicherwahl lässt sich ändern, vorhandene Objekte ziehen aber nicht von selbst um.",
      "Zwei Instanzen pro Region ist das Startkontingent.",
      "CloudTrail zeichnet Control-Plane-Aufrufe auf. Einschalten in dem Konto, nicht im Flow.",
    ],
    mistake: "Eine Produktionsinstanz in der falschen Region anlegen, weil die Konsole dort aufging.",
  },
  ja: {
    why: "インスタンスはユーザー、フロー、番号のテナント境界です。誤って二つ目を作ると、レポートと ID が割れます。",
    paras: [
      "作成時に ID を選びます。Connect に保存するユーザーか、SAML 2.0 か。発信と着信をするか、録音とレポートの置き場も選びます。後から ID を変えるのは切替ではなくプロジェクトです。",
      "管理 URL と CCP はインスタンスのエイリアスの my.connect.aws にあります。エイリアスを書き留めてください。ファイアウォールと SAML の ACS URL はそれに依存します。",
    ],
    points: [
      "同時通話の既定は 10 です。チームより大きい試験の前に引き上げを申請します。",
      "ストレージの選択は更新できますが、既存のオブジェクトは自分では移動しません。",
      "リージョンあたり 2 インスタンスが開始時のクォータです。",
      "CloudTrail はコントロールプレーンの呼び出しを記録します。フローの中ではなくアカウントで有効にします。",
    ],
    mistake: "コンソールが開いたリージョンのまま、本番インスタンスを作ること。",
  },
  hi: {
    why: "इंस्टेंस उपयोगकर्ताओं, फ़्लो और नंबरों की किरायेदारी सीमा है। गलती से दूसरा इंस्टेंस रिपोर्ट और पहचान को बाँट देता है।",
    paras: [
      "बनाते समय पहचान चुनते हैं: Connect में संग्रहीत उपयोगकर्ता या SAML 2.0। चुनते हैं कि इंस्टेंस कॉल करे और ले, और रिकॉर्डिंग व रिपोर्ट कहाँ जाएँ। बाद में पहचान बदलना परियोजना है, टॉगल नहीं।",
      "व्यवस्थापक URL और CCP इंस्टेंस उपनाम पर my.connect.aws के नीचे रहते हैं। उपनाम लिख लें। फ़ायरवॉल और SAML ACS URL उसी पर निर्भर हैं।",
    ],
    points: [
      "डिफ़ॉल्ट समवर्ती कॉल: 10। टीम से बड़े पायलट से पहले और माँगें।",
      "भंडारण विकल्प बदले जा सकते हैं, पर मौजूदा वस्तुएँ स्वयं नहीं हटतीं।",
      "प्रति क्षेत्र दो इंस्टेंस शुरुआती कोटा है।",
      "CloudTrail नियंत्रण-तल की कॉल दर्ज करता है। इसे खाते में चालू करें, फ़्लो के अंदर नहीं।",
    ],
    mistake: "कंसोल जहाँ खुला, वहीं ग़लत क्षेत्र में उत्पादन इंस्टेंस बनाना।",
  },
  te: {
    why: "ఇన్‌స్టాన్స్ వినియోగదారులు, ఫ్లోలు, నంబర్ల యాజమాన్య పరిధి. అనుకోకుండా రెండవది నివేదికలను మరియు గుర్తింపును చీలుస్తుంది.",
    paras: [
      "సృష్టిలో గుర్తింపు ఎంచుకుంటారు: Connect లో నిల్వ చేసిన వినియోగదారులు లేదా SAML 2.0. ఇన్‌స్టాన్స్ కాల్ చేస్తుందా, స్వీకరిస్తుందా, రికార్డింగ్‌లు మరియు నివేదికలు ఎక్కడికి వెళ్తాయో ఎంచుకుంటారు. తర్వాత గుర్తింపు మార్చడం ప్రాజెక్ట్, టోగుల్ కాదు.",
      "అడ్మిన్ URL మరియు CCP ఇన్‌స్టాన్స్ అలియాస్ కింద my.connect.aws లో ఉంటాయి. అలియాస్ రాసుకోండి. ఫైర్‌వాల్‌లు మరియు SAML ACS URL లు దానిపై ఆధారపడతాయి.",
    ],
    points: [
      "డిఫాల్ట్ ఏకకాల కాల్‌లు: 10. జట్టు కంటే పెద్ద పైలట్ ముందు ఎక్కువ అడగండి.",
      "నిల్వ ఎంపికలు నవీకరించవచ్చు, ఉన్న వస్తువులు తమంతట తాము కదలవు.",
      "రీజియన్‌కు రెండు ఇన్‌స్టాన్స్‌లు ప్రారంభ కోటా.",
      "CloudTrail కంట్రోల్-ప్లేన్ కాల్‌లను నమోదు చేస్తుంది. ఖాతాలో ఆన్ చేయండి, ఫ్లో లోపల కాదు.",
    ],
    mistake: "కన్సోల్ ఎక్కడ తెరిచిందో అక్కడే తప్పు రీజియన్‌లో ప్రొడక్షన్ ఇన్‌స్టాన్స్ సృష్టించడం.",
  },
  ar: {
    why: "المثيل هو حد الاستئجار للمستخدمين والتدفقات والأرقام. مثيل ثانٍ بالخطأ يقسم التقارير والهوية.",
    paras: [
      "عند الإنشاء تختار الهوية: مستخدمون مخزّنون في Connect أو SAML 2.0. وتختار إن كان المثيل يجري المكالمات ويستقبلها، وأين تذهب التسجيلات والتقارير. تغيير الهوية لاحقًا مشروع، لا مفتاح.",
      "عنوان الإدارة وCCP يعيشان على اسم المثيل المستعار تحت my.connect.aws. دوّن الاسم. جدران الحماية وعناوين ACS في SAML تعتمد عليه.",
    ],
    points: [
      "المكالمات المتزامنة الافتراضية: 10. اطلب المزيد قبل تجربة أكبر من فريق.",
      "خيارات التخزين تُحدَّث، لكن الكائنات الموجودة لا تنتقل وحدها.",
      "مثيلان لكل منطقة هما حصة البداية.",
      "CloudTrail يسجّل نداءات مستوى التحكم. فعّله في الحساب، لا داخل التدفق.",
    ],
    mistake: "إنشاء مثيل إنتاج في المنطقة الخطأ لأن وحدة التحكم فُتحت هناك.",
  },
});

put("tel-types", {
  es: {
    why: "El tipo de número es una decisión de coste y de dominio de fallo.",
    paras: [
      "Connect vende cuatro tipos, en más de 100 países, con cargo por día más telefonía por minuto. Un DID de EE. UU. en el ejemplo trabajado de Oregón es 0,030 USD al día, 0,0022 USD por minuto entrante y telefonía saliente de EE. UU. a 0,0048 USD por minuto.",
      "Los números gratuitos de EE. UU. se registran en SOMOS. AWS puede ponerlos en más de un operador, por eso cuestan más y son el número público más resistente. El ejemplo del apéndice cobra 0 USD al día los primeros 12 meses del nivel gratuito y 0,06 USD al día después. Las tarifas de países que no están en ese ejemplo se leen en la tabla global de telefonía, no se inventan.",
    ],
    points: [
      "Un DID es un operador. Presenta un número local. No se equilibra entre operadores.",
      "Se pueden mezclar DID y gratuito en una instancia.",
      "La telefonía entrante del ejemplo se cobra por minuto con un mínimo de 60 segundos.",
      "El servicio de voz es un segundo cargo, 0,038 o 0,018 USD por minuto según la forma del producto, por segundo con un mínimo de 10 segundos.",
    ],
    mistake: "Citar una tarifa por minuto de un número gratuito que no se consultó.",
  },
  fr: {
    why: "Le type de numéro est un choix de coût et de domaine de panne.",
    paras: [
      "Connect vend quatre types, dans plus de 100 pays, facturés par jour plus la téléphonie à la minute. Un DID des États-Unis dans l'exemple travaillé de l'Oregon est à 0,030 USD par jour, 0,0022 USD par minute entrante, et la téléphonie sortante US à 0,0048 USD par minute.",
      "Les numéros verts US sont enregistrés chez SOMOS. AWS peut les placer chez plus d'un opérateur, ce qui explique le prix et la résilience. L'exemple de l'annexe facture 0 USD par jour les 12 premiers mois de l'offre gratuite, puis 0,06 USD par jour. Les tarifs d'autres pays se lisent dans la table mondiale, ils ne s'inventent pas.",
    ],
    points: [
      "Un DID est un opérateur. Il présente un numéro local. Il n'est pas réparti entre opérateurs.",
      "DID et numéro vert peuvent cohabiter sur une instance.",
      "La téléphonie entrante de l'exemple est à la minute, minimum 60 secondes.",
      "Le service vocal est un second prix, 0,038 ou 0,018 USD par minute selon la forme du produit, à la seconde avec un minimum de 10 secondes.",
    ],
    mistake: "Citer un tarif à la minute d'un numéro vert que l'on n'a pas vérifié.",
  },
  de: {
    why: "Der Nummerntyp ist eine Kosten- und eine Fehlerdomänenwahl.",
    paras: [
      "Connect verkauft vier Typen, in mehr als 100 Ländern, pro Tag plus Telefonie pro Minute. Eine US-DID im Oregon-Beispiel kostet 0,030 USD pro Tag, 0,0022 USD pro eingehender Minute und ausgehende US-Telefonie 0,0048 USD pro Minute.",
      "US-Toll-free-Nummern werden bei SOMOS registriert. AWS kann sie auf mehr als einen Carrier legen, deshalb kosten sie mehr und sind die widerstandsfähigere öffentliche Nummer. Das Anhangsbeispiel berechnet 0 USD pro Tag in den ersten 12 Monaten der Free Tier und danach 0,06 USD pro Tag. Ländersätze, die nicht in dem Beispiel stehen, stehen in der globalen Telefonietabelle und werden nicht erfunden.",
    ],
    points: [
      "Eine DID ist ein Carrier. Sie zeigt eine Ortsnummer. Sie ist nicht über Carrier verteilt.",
      "DID und Toll-free können auf einer Instanz gemischt werden.",
      "Eingehende Telefonie im Beispiel wird pro Minute berechnet, Minimum 60 Sekunden.",
      "Der Sprachdienst ist eine zweite Gebühr, 0,038 oder 0,018 USD pro Minute je nach Produktform, pro Sekunde mit 10 Sekunden Minimum.",
    ],
    mistake: "Einen Toll-free-Minutenpreis nennen, den man nicht nachgeschlagen hat.",
  },
  ja: {
    why: "番号の種類は費用と障害ドメインの選択です。",
    paras: [
      "Connect は 100 を超える国で 4 種類を売り、日額に分あたりの電話料金が加わります。オレゴンの計算例の米国 DID は 1 日 0.030 USD、着信 1 分 0.0022 USD、米国への発信電話は 1 分 0.0048 USD です。",
      "米国のトールフリーは SOMOS に登録されます。AWS は複数のキャリアに載せられるので、高く、公開番号としてはより耐障害です。付録の例は無料枠の最初の 12 か月が 1 日 0 USD、その後 1 日 0.06 USD です。その例にない国の料金は世界の電話料金表で読み、作りません。",
    ],
    points: [
      "DID は 1 キャリアです。市内番号を出します。キャリア間で負荷分散しません。",
      "1 つのインスタンスに DID とトールフリーを混ぜられます。",
      "例の着信電話は分単位、最低 60 秒です。",
      "音声サービスは別料金で、製品形態により 1 分 0.038 または 0.018 USD、秒単位、最低 10 秒です。",
    ],
    mistake: "調べていないトールフリーの分単価を見積もること。",
  },
  hi: {
    why: "नंबर का प्रकार लागत और विफलता-क्षेत्र का चुनाव है।",
    paras: [
      "Connect चार प्रकार बेचता है, 100 से अधिक देशों में, प्रति दिन तथा प्रति मिनट टेलीफ़ोनी। ओरेगन के काम किए उदाहरण में एक अमेरिकी DID 0.030 USD प्रति दिन, आवक 0.0022 USD प्रति मिनट, और जावक अमेरिकी टेलीफ़ोनी 0.0048 USD प्रति मिनट है।",
      "अमेरिकी टोल-फ़्री नंबर SOMOS में पंजीकृत होते हैं। AWS उन्हें एक से अधिक कैरियर पर रख सकता है, इसलिए वे महँगे हैं और अधिक लचीला सार्वजनिक नंबर हैं। परिशिष्ट उदाहरण मुफ़्त स्तर के पहले 12 महीनों में 0 USD प्रति दिन और बाद में 0.06 USD प्रति दिन लेता है। उस उदाहरण में न होने वाली देश दरें वैश्विक टेलीफ़ोनी तालिका से पढ़ी जाती हैं, गढ़ी नहीं जातीं।",
    ],
    points: [
      "DID एक कैरियर है। वह स्थानीय नंबर दिखाता है। कैरियरों में संतुलित नहीं होता।",
      "एक इंस्टेंस पर DID और टोल-फ़्री मिलाए जा सकते हैं।",
      "उदाहरण में आवक टेलीफ़ोनी प्रति मिनट है, न्यूनतम 60 सेकंड।",
      "वॉइस सेवा दूसरा शुल्क है, उत्पाद रूप के अनुसार 0.038 या 0.018 USD प्रति मिनट, प्रति सेकंड, न्यूनतम 10 सेकंड।",
    ],
    mistake: "ऐसी टोल-फ़्री प्रति-मिनट दर उद्धृत करना जिसे देखा ही नहीं।",
  },
  te: {
    why: "నంబర్ రకం ఖర్చు మరియు వైఫల్య డొమైన్ ఎంపిక.",
    paras: [
      "Connect నాలుగు రకాలు అమ్ముతుంది, 100 కంటే ఎక్కువ దేశాల్లో, రోజుకు మరియు నిమిషానికి టెలిఫోనీ. ఒరెగాన్ ఉదాహరణలో US DID రోజుకు 0.030 USD, ఇన్‌బౌండ్ నిమిషానికి 0.0022 USD, అవుట్‌బౌండ్ US టెలిఫోనీ నిమిషానికి 0.0048 USD.",
      "US టోల్-ఫ్రీ నంబర్లు SOMOS లో నమోదు అవుతాయి. AWS వాటిని ఒకటి కంటే ఎక్కువ క్యారియర్‌లపై పెట్టగలదు, అందుకే ఖరీదు ఎక్కువ మరియు బహిరంగ నంబర్‌గా మరింత స్థిరం. అనుబంధ ఉదాహరణ ఉచిత శ్రేణి మొదటి 12 నెలలు రోజుకు 0 USD, తర్వాత రోజుకు 0.06 USD. ఆ ఉదాహరణలో లేని దేశ రేట్లు ప్రపంచ టెలిఫోనీ పట్టికలో చదవాలి, కల్పించకూడదు.",
    ],
    points: [
      "DID ఒక క్యారియర్. స్థానిక నంబర్ చూపిస్తుంది. క్యారియర్‌ల మధ్య సమతుల్యం కాదు.",
      "ఒక ఇన్‌స్టాన్స్‌లో DID మరియు టోల్-ఫ్రీ కలపవచ్చు.",
      "ఉదాహరణలో ఇన్‌బౌండ్ టెలిఫోనీ నిమిషానికి, కనీసం 60 సెకన్లు.",
      "వాయిస్ సేవ రెండవ ఛార్జ్, ఉత్పత్తి రూపం ప్రకారం నిమిషానికి 0.038 లేదా 0.018 USD, సెకనుకు, కనీసం 10 సెకన్లు.",
    ],
    mistake: "చూడని టోల్-ఫ్రీ నిమిష రేటును చెప్పడం.",
  },
  ar: {
    why: "نوع الرقم اختيار تكلفة ومجال عطل.",
    paras: [
      "تبيع Connect أربعة أنواع، في أكثر من 100 بلد، باليوم زائد هاتف بالدقيقة. رقم DID أمريكي في مثال أوريغون هو 0.030 USD في اليوم، و0.0022 USD لدقيقة الوارد، وهاتف صادر أمريكي 0.0048 USD للدقيقة.",
      "أرقام الولايات المتحدة المجانية تُسجَّل لدى SOMOS. تستطيع AWS وضعها على أكثر من ناقل، لذلك هي أغلى وأكثر تحملًا كرقم عام. مثال الملحق يحسب 0 USD في اليوم لأول 12 شهرًا من الطبقة المجانية ثم 0.06 USD في اليوم. أسعار البلدان غير الموجودة في المثال تُقرأ من جدول الهاتف العالمي ولا تُختلق.",
    ],
    points: [
      "DID ناقل واحد. يعرض رقمًا محليًا. لا يُوزَّع على النواقل.",
      "يمكن خلط DID والمجاني على مثيل واحد.",
      "هاتف الوارد في المثال بالدقيقة بحد أدنى 60 ثانية.",
      "خدمة الصوت رسم ثانٍ، 0.038 أو 0.018 USD للدقيقة حسب شكل المنتج، بالثانية بحد أدنى 10 ثوانٍ.",
    ],
    mistake: "اقتباس سعر دقيقة لرقم مجاني لم يُبحث عنه.",
  },
});

put("flows-types", {
  es: {
    why: "Cada tipo de flujo solo ofrece los bloques que tienen sentido ahí. Un flujo de espera no es el sitio para transferir a una cola y esperar suerte.",
    paras: [
      "Los flujos de entrada saludan y enrutan. Los de cola del cliente corren mientras espera y pueden ofrecer una devolución. Los de retención repiten avisos. Los de susurro suenan justo antes de la unión. Los de transferencia a agente y a cola son los que ejecutan las conexiones rápidas. Los de desconexión corren después del fin.",
      "Los susurros de salida son donde se configura la grabación saliente y donde pertenece Llamar a número de teléfono.",
    ],
    points: [
      "Un flujo de cola del cliente se puede interrumpir.",
      "Transferir a cola dentro de un flujo de cola del cliente mueve un contacto que ya está en cola.",
      "Fin de flujo / Reanudar termina el flujo y no cuelga.",
      "Desconectar cuelga.",
    ],
    mistake: "Poner la música de espera en el flujo de entrada y preguntarse por qué la espera está en silencio.",
  },
  fr: {
    why: "Chaque type de flux n'offre que les blocs qui y ont un sens. Un flux d'attente n'est pas l'endroit pour transférer vers une file en espérant.",
    paras: [
      "Les flux entrants accueillent et routent. Les flux de file client tournent pendant l'attente et peuvent proposer un rappel. Les flux de mise en attente bouclent les invites. Les chuchotements jouent juste avant la jonction. Les flux de transfert vers agent et vers file sont ceux que les connexions rapides exécutent. Les flux de déconnexion tournent après la fin.",
      "Les chuchotements sortants sont l'endroit où régler l'enregistrement sortant et où Appeler un numéro de téléphone a sa place.",
    ],
    points: [
      "Un flux de file client est interruptible.",
      "Transférer vers une file dans un flux de file client déplace un contact déjà en file.",
      "Fin de flux / Reprendre termine le flux et ne raccroche pas.",
      "Déconnecter raccroche.",
    ],
    mistake: "Mettre la musique d'attente dans le flux entrant et s'étonner que l'attente soit silencieuse.",
  },
  de: {
    why: "Jeder Flow-Typ bietet nur die Blöcke, die dort Sinn haben. Ein Halte-Flow ist nicht der Ort, um in eine Queue zu übergeben und zu hoffen.",
    paras: [
      "Eingehende Flows begrüßen und routen. Kundenqueue-Flows laufen während der Wartezeit und können einen Rückruf anbieten. Halte-Flows wiederholen Ansagen. Whisper-Flows spielen kurz vor dem Verbinden. Transfer-zu-Agent und Transfer-zu-Queue sind das, was Quick Connects ausführen. Disconnect-Flows laufen nach dem Ende.",
      "Ausgehende Whisper-Flows sind der Ort für ausgehende Aufzeichnung und für Telefonnummer anrufen.",
    ],
    points: [
      "Ein Kundenqueue-Flow ist unterbrechbar.",
      "Transfer zur Queue in einem Kundenqueue-Flow verschiebt einen Kontakt, der schon wartet.",
      "Flow beenden / Fortsetzen beendet den Flow und legt nicht auf.",
      "Disconnect legt auf.",
    ],
    mistake: "Wartemusik in den eingehenden Flow legen und sich wundern, warum Halten still ist.",
  },
  ja: {
    why: "フローの種類ごとに、そこで意味のあるブロックだけが出ます。保留フローはキューへ転送して祈る場所ではありません。",
    paras: [
      "着信フローは挨拶して振り分けます。カスタマーキューフローは待ち時間に動き、コールバックを出せます。保留フローはプロンプトを繰り返します。ウィスパーは接続の直前に流れます。エージェント転送とキュー転送はクイックコネクトが実行するものです。切断フローは終了後に動きます。",
      "発信ウィスパーは発信の録音を設定し、電話番号への発信が属する場所です。",
    ],
    points: [
      "カスタマーキューフローは割り込めます。",
      "カスタマーキューフローの中のキュー転送は、すでに待っているコンタクトを動かします。",
      "フロー終了 / 再開はフローを終え、電話は切りません。",
      "切断は電話を切ります。",
    ],
    mistake: "保留音を着信フローに入れて、保留が無音な理由を探すこと。",
  },
  hi: {
    why: "हर फ़्लो प्रकार केवल वही ब्लॉक देता है जो वहाँ अर्थ रखते हैं। होल्ड फ़्लो कतार में स्थानांतरित करके आशा करने की जगह नहीं है।",
    paras: [
      "इनबाउंड फ़्लो स्वागत और रूटिंग करते हैं। ग्राहक कतार फ़्लो प्रतीक्षा के दौरान चलते हैं और कॉलबैक दे सकते हैं। होल्ड फ़्लो संकेत दोहराते हैं। व्हिस्पर जुड़ने से ठीक पहले बजते हैं। एजेंट-स्थानांतरण और कतार-स्थानांतरण वही हैं जो त्वरित कनेक्ट चलाते हैं। डिस्कनेक्ट फ़्लो अंत के बाद चलते हैं।",
      "आउटबाउंड व्हिस्पर वहाँ हैं जहाँ आउटबाउंड रिकॉर्डिंग सेट होती है और फ़ोन नंबर पर कॉल का स्थान है।",
    ],
    points: [
      "ग्राहक कतार फ़्लो बाधित किया जा सकता है।",
      "ग्राहक कतार फ़्लो के अंदर कतार में स्थानांतरण पहले से कतारबद्ध संपर्क को हटाता है।",
      "फ़्लो समाप्त / फिर शुरू फ़्लो खत्म करता है और काटता नहीं।",
      "डिस्कनेक्ट काटता है।",
    ],
    mistake: "होल्ड संगीत इनबाउंड फ़्लो में रखकर आश्चर्य करना कि होल्ड शांत क्यों है।",
  },
  te: {
    why: "ప్రతి ఫ్లో రకం అక్కడ అర్థమయ్యే బ్లాక్‌లనే ఇస్తుంది. హోల్డ్ ఫ్లో క్యూకు బదిలీ చేసి ఆశించే చోటు కాదు.",
    paras: [
      "ఇన్‌బౌండ్ ఫ్లోలు పలకరిస్తాయి మరియు మళ్లిస్తాయి. కస్టమర్ క్యూ ఫ్లోలు వేచి ఉన్నప్పుడు నడుస్తాయి మరియు కాల్‌బ్యాక్ ఇవ్వగలవు. హోల్డ్ ఫ్లోలు ప్రాంప్ట్‌లను మళ్లీ మళ్లీ వినిపిస్తాయి. విస్పర్ కలవడానికి కాస్త ముందు వినిపిస్తుంది. ఏజెంట్ బదిలీ మరియు క్యూ బదిలీని క్విక్ కనెక్ట్‌లు నడుపుతాయి. డిస్‌కనెక్ట్ ఫ్లోలు ముగింపు తర్వాత నడుస్తాయి.",
      "అవుట్‌బౌండ్ విస్పర్ అవుట్‌బౌండ్ రికార్డింగ్ పెట్టే చోటు, మరియు ఫోన్ నంబర్‌కు కాల్ చెందే చోటు.",
    ],
    points: [
      "కస్టమర్ క్యూ ఫ్లో అంతరాయం కలిగించదగినది.",
      "కస్టమర్ క్యూ ఫ్లో లోపల క్యూకు బదిలీ ఇప్పటికే క్యూలో ఉన్న కాంటాక్ట్‌ను కదిలిస్తుంది.",
      "ఫ్లో ముగింపు / పునఃప్రారంభం ఫ్లోను ముగిస్తుంది, ఫోన్ పెట్టదు.",
      "డిస్‌కనెక్ట్ ఫోన్ పెడుతుంది.",
    ],
    mistake: "హోల్డ్ సంగీతాన్ని ఇన్‌బౌండ్ ఫ్లోలో పెట్టి హోల్డ్ నిశ్శబ్దం ఎందుకో ఆశ్చర్యపడటం.",
  },
  ar: {
    why: "كل نوع تدفق يعرض فقط الكتل التي لها معنى هناك. تدفق الانتظار ليس مكانًا للتحويل إلى طابور والأمل.",
    paras: [
      "تدفقات الوارد ترحب وتوجّه. تدفقات طابور العميل تعمل أثناء الانتظار ويمكن أن تعرض معاودة اتصال. تدفقات التعليق تعيد المطالبات. الهمس يُشغَّل قبل الالتحام مباشرة. التحويل إلى وكيل والتحويل إلى طابور هما ما تشغّله الاتصالات السريعة. تدفقات القطع تعمل بعد النهاية.",
      "همس الصادر هو حيث تُضبط تسجيلات الصادر وحيث تنتمي مكالمة رقم الهاتف.",
    ],
    points: [
      "تدفق طابور العميل قابل للمقاطعة.",
      "التحويل إلى طابور داخل تدفق طابور العميل ينقل جهة اتصال منتظرة أصلًا.",
      "إنهاء التدفق / استئناف ينهي التدفق ولا يقفل الخط.",
      "القطع يقفل الخط.",
    ],
    mistake: "وضع موسيقى الانتظار في تدفق الوارد ثم التساؤل لماذا الانتظار صامت.",
  },
});

put("lex-get-input", {
  es: {
    why: "No hay un bloque Lex aparte que buscar. Obtener entrada del cliente es donde se elige el bot.",
    paras: [
      "Se asocia un alias de bot Lex V2 a la instancia, a menudo con aws_connect_bot_association o la consola, y luego el bloque elige ese alias. La cuota por defecto es 70 bots y 100 alias V2.",
      "En Connect Customer el ejemplo de precio trabajado cobra 0 USD por las propias solicitudes de voz de Lex. Igual se pagan los minutos de voz.",
    ],
    points: [
      "Ramifica por el nombre de intención que configuraste, no por la frase que dijo quien llama.",
      "Los slots están vacíos si quien llama cuelga a mitad del aviso. Hay que manejarlo.",
      "DTMF y voz pueden llenar un slot. Prueba ambos.",
      "Una intención de reserva debe llegar a una persona o a una devolución.",
    ],
    mistake: "Construir el bot en Lex y olvidar asociar el alias a la instancia.",
  },
  fr: {
    why: "Il n'y a pas de bloc Lex séparé à chercher. Obtenir l'entrée du client est l'endroit où le bot est choisi.",
    paras: [
      "On associe un alias de bot Lex V2 à l'instance, souvent avec aws_connect_bot_association ou la console, puis le bloc choisit cet alias. Le quota par défaut est 70 bots et 100 alias V2.",
      "Sur Connect Customer l'exemple de prix travaillé facture 0 USD pour les requêtes vocales Lex elles-mêmes. Les minutes vocales se paient quand même.",
    ],
    points: [
      "Brancher sur le nom d'intention configuré, pas sur la phrase dite.",
      "Les slots sont vides si l'appelant raccroche au milieu de l'invite. Il faut le traiter.",
      "DTMF et parole peuvent remplir un slot. Tester les deux.",
      "Une intention de repli doit atteindre une personne ou un rappel.",
    ],
    mistake: "Construire le bot dans Lex et oublier d'associer l'alias à l'instance.",
  },
  de: {
    why: "Es gibt keinen eigenen Lex-Block zum Suchen. Kundeneingabe abrufen ist der Ort, an dem der Bot gewählt wird.",
    paras: [
      "Ein Lex-V2-Bot-Alias wird der Instanz zugeordnet, oft mit aws_connect_bot_association oder der Konsole, und der Block wählt diesen Alias. Das Standardkontingent ist 70 Bots und 100 V2-Aliasse.",
      "Bei Connect Customer berechnet das Preisbeispiel 0 USD für die Lex-Sprachanfragen selbst. Die Sprachminuten werden trotzdem bezahlt.",
    ],
    points: [
      "Nach dem konfigurierten Intent-Namen verzweigen, nicht nach dem Satz der Anruferin.",
      "Slots sind leer, wenn während der Ansage aufgelegt wird. Das behandeln.",
      "DTMF und Sprache können einen Slot füllen. Beides testen.",
      "Ein Fallback-Intent soll eine Person oder einen Rückruf erreichen.",
    ],
    mistake: "Den Bot in Lex bauen und vergessen, den Alias der Instanz zuzuordnen.",
  },
  ja: {
    why: "別に探す Lex ブロックはありません。顧客入力の取得がボットを選ぶ場所です。",
    paras: [
      "Lex V2 ボットのエイリアスをインスタンスに関連付けます。多くは aws_connect_bot_association かコンソールです。その後ブロックがそのエイリアスを選びます。既定のクォータはボット 70、V2 エイリアス 100 です。",
      "Connect Customer の料金例では Lex の音声リクエスト自体は 0 USD です。音声の分は別に払います。",
    ],
    points: [
      "分岐は設定したインテント名で行い、発信者が言った文では行いません。",
      "プロンプトの途中で切れるとスロットは空です。それを扱います。",
      "DTMF と音声の両方がスロットを埋められます。両方試します。",
      "フォールバックのインテントは人かコールバックに届くべきです。",
    ],
    mistake: "Lex でボットを作り、エイリアスをインスタンスに関連付けるのを忘れること。",
  },
  hi: {
    why: "खोजने के लिए अलग Lex ब्लॉक नहीं है। ग्राहक इनपुट प्राप्त करना वही जगह है जहाँ बॉट चुना जाता है।",
    paras: [
      "Lex V2 बॉट उपनाम इंस्टेंस से जोड़ा जाता है, अक्सर aws_connect_bot_association या कंसोल से, फिर ब्लॉक वह उपनाम चुनता है। डिफ़ॉल्ट कोटा 70 बॉट और 100 V2 उपनाम है।",
      "Connect Customer पर काम किए मूल्य उदाहरण में Lex वाक् अनुरोध स्वयं 0 USD हैं। वाक् मिनट फिर भी देने होते हैं।",
    ],
    points: [
      "उस इरादे के नाम पर शाखा बनाएँ जिसे कॉन्फ़िगर किया, कॉलर के वाक्य पर नहीं।",
      "संकेत के बीच में काटने पर स्लॉट खाली रहते हैं। उसे संभालें।",
      "DTMF और वाक् दोनों स्लॉट भर सकते हैं। दोनों जाँचें।",
      "फ़ॉलबैक इरादा व्यक्ति या कॉलबैक तक पहुँचना चाहिए।",
    ],
    mistake: "Lex में बॉट बनाकर उपनाम को इंस्टेंस से जोड़ना भूल जाना।",
  },
  te: {
    why: "వెతకడానికి వేరే Lex బ్లాక్ లేదు. కస్టమర్ ఇన్‌పుట్ పొందడమే బాట్ ఎంపిక అయ్యే చోటు.",
    paras: [
      "Lex V2 బాట్ అలియాస్‌ను ఇన్‌స్టాన్స్‌కు అనుబంధిస్తారు, తరచుగా aws_connect_bot_association లేదా కన్సోల్‌తో, తర్వాత బ్లాక్ ఆ అలియాస్‌ను ఎంచుకుంటుంది. డిఫాల్ట్ కోటా 70 బాట్‌లు మరియు 100 V2 అలియాస్‌లు.",
      "Connect Customer ధర ఉదాహరణలో Lex స్పీచ్ అభ్యర్థనలు స్వయంగా 0 USD. వాయిస్ నిమిషాలు అయినా చెల్లించాలి.",
    ],
    points: [
      "మీరు సెట్ చేసిన ఇంటెంట్ పేరుపై శాఖ, కాలర్ చెప్పిన వాక్యంపై కాదు.",
      "ప్రాంప్ట్ మధ్యలో పెడితే స్లాట్‌లు ఖాళీ. దాన్ని నిర్వహించండి.",
      "DTMF మరియు స్పీచ్ రెండూ స్లాట్ నింపగలవు. రెండూ పరీక్షించండి.",
      "ఫాల్‌బ్యాక్ ఇంటెంట్ వ్యక్తిని లేదా కాల్‌బ్యాక్‌ను చేరాలి.",
    ],
    mistake: "Lex లో బాట్ కట్టి అలియాస్‌ను ఇన్‌స్టాన్స్‌కు అనుబంధించడం మర్చిపోవడం.",
  },
  ar: {
    why: "لا توجد كتلة Lex منفصلة تُبحث. الحصول على إدخال العميل هو حيث يُختار الروبوت.",
    paras: [
      "تربط اسمًا مستعارًا لروبوت Lex V2 بالمثيل، غالبًا بـ aws_connect_bot_association أو وحدة التحكم، ثم تختار الكتلة ذلك الاسم. الحصة الافتراضية 70 روبوتًا و100 اسم V2.",
      "في Connect Customer يحسب مثال التسعير 0 USD لطلبات كلام Lex نفسها. دقائق الصوت تُدفع رغم ذلك.",
    ],
    points: [
      "تفرّع على اسم النية الذي ضبطته، لا على الجملة التي قالها المتصل.",
      "الخانات فارغة إذا أغلق المتصل وسط المطالبة. عالج ذلك.",
      "DTMF والكلام يمكن أن يملآ خانة. اختبر الاثنين.",
      "نية الاحتياط يجب أن تصل إلى شخص أو معاودة اتصال.",
    ],
    mistake: "بناء الروبوت في Lex ونسيان ربط الاسم المستعار بالمثيل.",
  },
});

put("ai-names", {
  es: {
    why: "Usar el nombre viejo en una revisión de diseño está bien. Usarlo como único nombre en un runbook de 2026 no.",
    paras: [
      "Wisdom entró en vista previa el 1 de diciembre de 2020 y estuvo disponible de forma general el 27 de septiembre de 2021. El 28 de noviembre de 2023 Amazon Q in Connect incluyó esa función y añadió respuestas generativas. El 4 de agosto de 2026 la guía de administración renombró Amazon Q in Connect a agent assist.",
      "La referencia de autorización del servicio seguía mostrando el prefijo wisdom en septiembre de 2026. Las políticas y los comandos de la CLI pueden decir wisdom o qconnect. Lee la referencia antes de escribir una política nueva.",
    ],
    points: [
      "Connect assistant asocia un dominio de agentes de IA al contacto.",
      "El autoservicio con el asistente se anunció el 1 de diciembre de 2024.",
      "El autoservicio agéntico, incluido Nova Sonic para voz, se anunció el 30 de noviembre de 2025.",
      "Agentic CX designer estuvo en vista previa el 22 de junio de 2026 y disponible de forma general el 2 de septiembre de 2026.",
    ],
    mistake: "Escribir una política para un nombre de servicio que la referencia de IAM no usa.",
  },
  fr: {
    why: "Utiliser l'ancien nom dans une revue de conception va. L'utiliser comme seul nom dans un runbook de 2026, non.",
    paras: [
      "Wisdom est entré en préversion le 1er décembre 2020 et en disponibilité générale le 27 septembre 2021. Le 28 novembre 2023 Amazon Q in Connect a inclus cette fonction et ajouté des réponses génératives. Le 4 août 2026 le guide d'administration a renommé Amazon Q in Connect en agent assist.",
      "La référence d'autorisation du service montrait encore le préfixe wisdom en septembre 2026. Les politiques et les commandes CLI peuvent dire wisdom ou qconnect. Lisez la référence avant d'écrire une politique neuve.",
    ],
    points: [
      "Connect assistant associe un domaine d'agents IA au contact.",
      "Le libre-service avec l'assistant a été annoncé le 1er décembre 2024.",
      "Le libre-service agentique, y compris Nova Sonic pour la voix, a été annoncé le 30 novembre 2025.",
      "Agentic CX designer était en préversion le 22 juin 2026 et en disponibilité générale le 2 septembre 2026.",
    ],
    mistake: "Écrire une politique pour un nom de service que la référence IAM n'utilise pas.",
  },
  de: {
    why: "Den alten Namen in einem Design-Review zu nutzen ist in Ordnung. Ihn 2026 als einzigen Namen im Runbook zu nutzen nicht.",
    paras: [
      "Wisdom ging am 1. Dezember 2020 in die Vorschau und am 27. September 2021 allgemein verfügbar. Am 28. November 2023 nahm Amazon Q in Connect diese Funktion auf und ergänzte generative Antworten. Am 4. August 2026 benannte das Admin-Handbuch Amazon Q in Connect in agent assist um.",
      "Die Service-Authorization-Referenz zeigte im September 2026 noch das Präfix wisdom. Richtlinien und CLI-Befehle können wisdom oder qconnect sagen. Die Referenz lesen, bevor eine neue Richtlinie entsteht.",
    ],
    points: [
      "Connect assistant ordnet dem Kontakt eine AI-Agents-Domäne zu.",
      "Self-Service mit dem Assistenten wurde am 1. Dezember 2024 angekündigt.",
      "Agentischer Self-Service, einschließlich Nova Sonic für Sprache, wurde am 30. November 2025 angekündigt.",
      "Agentic CX designer war am 22. Juni 2026 in der Vorschau und am 2. September 2026 allgemein verfügbar.",
    ],
    mistake: "Eine Richtlinie für einen Dienstnamen schreiben, den die IAM-Referenz nicht benutzt.",
  },
  ja: {
    why: "設計レビューで古い名前を使うのは構いません。2026 年のランブックでそれだけを名前にするのは違います。",
    paras: [
      "Wisdom は 2020年12月1日にプレビュー、2021年9月27日に一般提供になりました。2023年11月28日に Amazon Q in Connect がその機能を含み、生成応答を加えました。2026年8月4日に管理ガイドは Amazon Q in Connect を agent assist に改名しました。",
      "サービスの認可リファレンスは 2026年9月も wisdom プレフィックスを示していました。ポリシーと CLI は wisdom または qconnect と言えます。新しいポリシーの前にリファレンスを読みます。",
    ],
    points: [
      "Connect assistant は AI エージェントのドメインをコンタクトに関連付けます。",
      "アシスタントによるセルフサービスは 2024年12月1日に発表されました。",
      "音声の Nova Sonic を含むエージェンティックなセルフサービスは 2025年11月30日に発表されました。",
      "Agentic CX designer は 2026年6月22日にプレビュー、2026年9月2日に一般提供です。",
    ],
    mistake: "IAM リファレンスが使わないサービス名でポリシーを書くこと。",
  },
  hi: {
    why: "डिज़ाइन समीक्षा में पुराना नाम ठीक है। 2026 की रनबुक में केवल वही नाम रखना ठीक नहीं।",
    paras: [
      "Wisdom 1 दिसंबर 2020 को पूर्वावलोकन में आया और 27 सितंबर 2021 को सामान्य रूप से उपलब्ध हुआ। 28 नवंबर 2023 को Amazon Q in Connect ने वह कार्य शामिल किया और जनरेटिव उत्तर जोड़े। 4 अगस्त 2026 को व्यवस्थापक गाइड ने Amazon Q in Connect का नाम agent assist किया।",
      "सेवा प्राधिकरण संदर्भ सितंबर 2026 में भी wisdom उपसर्ग दिखा रहा था। नीतियाँ और CLI wisdom या qconnect कह सकती हैं। नई नीति से पहले संदर्भ पढ़ें।",
    ],
    points: [
      "Connect assistant संपर्क से एक AI एजेंट डोमेन जोड़ता है।",
      "सहायक के साथ स्वयं-सेवा 1 दिसंबर 2024 को घोषित हुई।",
      "आवाज़ के लिए Nova Sonic सहित एजेंटिक स्वयं-सेवा 30 नवंबर 2025 को घोषित हुई।",
      "Agentic CX designer 22 जून 2026 को पूर्वावलोकन और 2 सितंबर 2026 को सामान्य उपलब्ध था।",
    ],
    mistake: "ऐसे सेवा नाम की नीति लिखना जिसका IAM संदर्भ उपयोग नहीं करता।",
  },
  te: {
    why: "డిజైన్ సమీక్షలో పాత పేరు సరే. 2026 రన్‌బుక్‌లో అదే ఏకైక పేరుగా ఉంచడం కాదు.",
    paras: [
      "Wisdom 1 డిసెంబర్ 2020 న ప్రివ్యూ, 27 సెప్టెంబర్ 2021 న సాధారణంగా అందుబాటులోకి వచ్చింది. 28 నవంబర్ 2023 న Amazon Q in Connect ఆ పనిని చేర్చి జనరేటివ్ సమాధానాలు జోడించింది. 4 ఆగస్టు 2026 న అడ్మిన్ గైడ్ Amazon Q in Connect ను agent assist గా మార్చింది.",
      "సేవా అధికార సూచన సెప్టెంబర్ 2026 లో కూడా wisdom ప్రిఫిక్స్ చూపింది. పాలసీలు మరియు CLI wisdom లేదా qconnect అనవచ్చు. కొత్త పాలసీ ముందు సూచన చదవండి.",
    ],
    points: [
      "Connect assistant కాంటాక్ట్‌కు AI ఏజెంట్ డొమైన్‌ను అనుబంధిస్తుంది.",
      "అసిస్టెంట్‌తో స్వయం సేవ 1 డిసెంబర్ 2024 న ప్రకటించబడింది.",
      "వాయిస్ కోసం Nova Sonic తో సహా ఏజెంటిక్ స్వయం సేవ 30 నవంబర్ 2025 న ప్రకటించబడింది.",
      "Agentic CX designer 22 జూన్ 2026 న ప్రివ్యూ, 2 సెప్టెంబర్ 2026 న సాధారణంగా అందుబాటు.",
    ],
    mistake: "IAM సూచన ఉపయోగించని సేవా పేరుకు పాలసీ రాయడం.",
  },
  ar: {
    why: "استخدام الاسم القديم في مراجعة تصميم مقبول. استخدامه الاسم الوحيد في دليل تشغيل 2026 ليس كذلك.",
    paras: [
      "دخل Wisdom المعاينة في 1 ديسمبر 2020 وصار متاحًا عامًا في 27 سبتمبر 2021. في 28 نوفمبر 2023 ضم Amazon Q in Connect تلك الوظيفة وأضاف إجابات توليدية. في 4 أغسطس 2026 أعاد دليل الإدارة تسمية Amazon Q in Connect إلى agent assist.",
      "مرجع تفويض الخدمة كان ما زال يظهر بادئة wisdom في سبتمبر 2026. السياسات وأوامر CLI قد تقول wisdom أو qconnect. اقرأ المرجع قبل كتابة سياسة جديدة.",
    ],
    points: [
      "Connect assistant يربط نطاق وكلاء ذكاء بالجهة.",
      "الخدمة الذاتية مع المساعد أُعلنت في 1 ديسمبر 2024.",
      "الخدمة الذاتية الوكيلية، بما فيها Nova Sonic للصوت، أُعلنت في 30 نوفمبر 2025.",
      "Agentic CX designer كان معاينة في 22 يونيو 2026 ومتاحًا عامًا في 2 سبتمبر 2026.",
    ],
    mistake: "كتابة سياسة لاسم خدمة لا يستخدمه مرجع IAM.",
  },
});

put("lambda-contract", {
  es: {
    why: "Connect no depura tu función. Ramifica.",
    paras: [
      "Cumple la validación de respuesta del bloque. Un mapa de cadenas es un objeto plano de cadenas. La validación JSON permite JSON anidado. La guía de re:Post dice mantener la carga pequeña, con 32 KB como la cifra que la gente alcanza, y restringir los valores a caracteres que Connect acepta cuando estás en un mapa de cadenas.",
      "Imprime el ContactId. Correlaciona por hora solo si se te olvidó.",
    ],
    points: [
      "Escrituras idempotentes. Hay reintentos.",
      "Los tiempos de espera en la consola de Lambda deben ser mayores que el del bloque o añadirás un segundo modo de fallo.",
      "Los arranques en frío cuentan contra los 8 segundos.",
      "Los secretos se quedan en el entorno de la función o en Secrets Manager, no en atributos del flujo.",
    ],
    mistake: "Devolver un dict de Python con números y listas a un bloque de mapa de cadenas.",
  },
  fr: {
    why: "Connect ne débogue pas votre fonction. Il branche.",
    paras: [
      "Respectez la validation de réponse du bloc. Une carte de chaînes est un objet plat de chaînes. La validation JSON autorise du JSON imbriqué. Le conseil re:Post dit de garder la charge petite, 32 Ko étant le chiffre que les gens atteignent, et de limiter les valeurs aux caractères que Connect accepte sur une carte de chaînes.",
      "Affichez le ContactId. Corrélez par l'heure seulement si vous avez oublié.",
    ],
    points: [
      "Écritures idempotentes. Les reprises arrivent.",
      "Les délais dans la console Lambda doivent dépasser celui du bloc, sinon vous ajoutez un second mode de panne.",
      "Les démarrages à froid comptent dans les 8 secondes.",
      "Les secrets restent dans l'environnement de la fonction ou dans Secrets Manager, pas dans les attributs du flux.",
    ],
    mistake: "Renvoyer un dict Python avec des nombres et des listes à un bloc de carte de chaînes.",
  },
  de: {
    why: "Connect debuggt Ihre Funktion nicht. Es verzweigt.",
    paras: [
      "Die Antwortprüfung des Blocks einhalten. Eine String-Map ist ein flaches Objekt aus Zeichenketten. JSON-Prüfung erlaubt verschachteltes JSON. Die re:Post-Hinweise sagen, die Nutzlast klein zu halten, 32 KB ist die Zahl, an die Leute stoßen, und Werte auf Zeichen zu beschränken, die Connect bei einer String-Map annimmt.",
      "Die ContactId ausgeben. Nur nach Zeit korrelieren, wenn sie vergessen wurde.",
    ],
    points: [
      "Idempotente Schreibvorgänge. Wiederholungen kommen vor.",
      "Timeouts in der Lambda-Konsole müssen höher sein als der Block, sonst entsteht ein zweiter Fehlermodus.",
      "Kaltstarts zählen zu den 8 Sekunden.",
      "Geheimnisse bleiben in der Funktionsumgebung oder in Secrets Manager, nicht in Flow-Attributen.",
    ],
    mistake: "Ein Python-Dict mit Zahlen und Listen an einen String-Map-Block zurückgeben.",
  },
  ja: {
    why: "Connect は関数をデバッグしません。分岐します。",
    paras: [
      "ブロックの応答検証に合わせます。文字列マップは文字列だけの平らなオブジェクトです。JSON 検証は入れ子の JSON を許します。re:Post の案内はペイロードを小さく保つこと、人が当たる数字は 32 KB、文字列マップでは Connect が受け付ける文字に値を限ることです。",
      "ContactId を出します。時刻だけで結び付けるのは忘れたときだけです。",
    ],
    points: [
      "書き込みは冪等に。再試行は起きます。",
      "Lambda コンソールのタイムアウトはブロックより長くしないと、二つ目の失敗モードが増えます。",
      "コールドスタートは 8 秒に含まれます。",
      "秘密は関数の環境か Secrets Manager に置き、フロー属性には置きません。",
    ],
    mistake: "数値とリストを含む Python の dict を文字列マップのブロックに返すこと。",
  },
  hi: {
    why: "Connect आपके फ़ंक्शन को डीबग नहीं करता। वह शाखा बनाता है।",
    paras: [
      "ब्लॉक की प्रतिक्रिया जाँच से मेल खाएँ। स्ट्रिंग मैप तारों की सपाट वस्तु है। JSON जाँच घोंसला JSON होने देती है। re:Post मार्गदर्शन भार छोटा रखने को कहता है, 32 KB वह आँकड़ा है जिस पर लोग पहुँचते हैं, और स्ट्रिंग मैप पर मान उन वर्णों तक सीमित रखें जिन्हें Connect स्वीकार करता है।",
      "ContactId छापें। समय से जोड़ना तभी जब भूल गए हों।",
    ],
    points: [
      "लेखन पुनरावृत्ति-सह। पुनः प्रयास होते हैं।",
      "Lambda कंसोल का समय-सीमा ब्लॉक से अधिक होनी चाहिए वरना दूसरा विफलता मोड जुड़ता है।",
      "ठंडी शुरुआत 8 सेकंड में गिनी जाती है।",
      "रहस्य फ़ंक्शन वातावरण या Secrets Manager में रहते हैं, फ़्लो गुणों में नहीं।",
    ],
    mistake: "संख्याओं और सूचियों वाला Python dict स्ट्रिंग-मैप ब्लॉक को लौटाना।",
  },
  te: {
    why: "Connect మీ ఫంక్షన్‌ను డీబగ్ చేయదు. అది శాఖలు వేస్తుంది.",
    paras: [
      "బ్లాక్ స్పందన ధృవీకరణకు సరిపోండి. స్ట్రింగ్ మ్యాప్ స్ట్రింగ్‌ల సమతల వస్తువు. JSON ధృవీకరణ గూడు JSON ను అనుమతిస్తుంది. re:Post మార్గదర్శకం పేలోడ్ చిన్నదిగా ఉంచమని చెబుతుంది, ప్రజలు తగిలే సంఖ్య 32 KB, స్ట్రింగ్ మ్యాప్‌లో Connect అంగీకరించే అక్షరాలకే విలువలను పరిమితం చేయండి.",
      "ContactId ముద్రించండి. సమయంతో కలపడం మర్చిపోతేనే.",
    ],
    points: [
      "రాతలు ఐడెంపోటెంట్. మళ్లీ ప్రయత్నాలు జరుగుతాయి.",
      "Lambda కన్సోల్ గడువులు బ్లాక్ కంటే ఎక్కువగా ఉండాలి, లేకపోతే రెండవ వైఫల్యం చేరుతుంది.",
      "చల్లని ప్రారంభాలు 8 సెకన్లలో లెక్క.",
      "రహస్యాలు ఫంక్షన్ వాతావరణంలో లేదా Secrets Manager లో ఉంటాయి, ఫ్లో లక్షణాల్లో కాదు.",
    ],
    mistake: "సంఖ్యలు మరియు జాబితాలతో Python dict ను స్ట్రింగ్-మ్యాప్ బ్లాక్‌కు తిరిగి ఇవ్వడం.",
  },
  ar: {
    why: "Connect لا يصحح دالتك. هو يفرّع.",
    paras: [
      "طابق تحقق استجابة الكتلة. خريطة السلاسل كائن مسطح من سلاسل. تحقق JSON يسمح بـ JSON متداخل. إرشاد re:Post يقول أبقِ الحمولة صغيرة، و32 KB هو الرقم الذي يبلغه الناس، وقيّد القيم بالمحارف التي تقبلها Connect حين تكون على خريطة سلاسل.",
      "اطبع ContactId. اربط بالوقت فقط إذا نسيت.",
    ],
    points: [
      "كتابات متماثلة المفعول. تحدث إعادات.",
      "مهلات وحدة Lambda يجب أن تكون أعلى من مهلة الكتلة وإلا أضفت نمط فشل ثانٍ.",
      "البدء البارد يُحتسب ضمن الثواني الثماني.",
      "الأسرار تبقى في بيئة الدالة أو Secrets Manager، لا في سمات التدفق.",
    ],
    mistake: "إرجاع dict بايثون فيه أعداد وقوائم إلى كتلة خريطة سلاسل.",
  },
});

put("route-queue", {
  es: {
    why: "Una cola sin nadie cuyo perfil la incluya es un aparcamiento en silencio.",
    paras: [
      "Creas una cola, le pones horario, un identificador de llamada saliente y conexiones rápidas opcionales. Establecer cola de trabajo la selecciona. Transferir a cola coloca el contacto. El valor por defecto es 100 colas y 50 combinaciones cola-canal por perfil de enrutamiento.",
      "Las colas de agente son para transferencias a una persona. El tope por defecto es 10 contactos esperando en una cola de agente.",
    ],
    points: [
      "La prioridad es por perfil, no una propiedad solo de la cola.",
      "Un contacto puede quedarse en una cola fuera de horario si nunca comprobaste el horario.",
      "Las devoluciones siguen ocupando la lógica de la cola. Necesitan un perfil con personal.",
      "Nombra las colas por el trabajo, no por una persona.",
    ],
    mistake: "Construir una cola por agente.",
  },
  fr: {
    why: "Une file que le profil de personne n'inclut pas est un parking silencieux.",
    paras: [
      "Vous créez une file, y attachez des horaires, un identifiant d'appel sortant et des connexions rapides facultatives. Définir la file de travail la sélectionne. Transférer vers la file place le contact. Le défaut est 100 files et 50 combinaisons file-canal par profil de routage.",
      "Les files d'agent servent aux transferts vers une personne. Le plafond par défaut est 10 contacts en attente sur une file d'agent.",
    ],
    points: [
      "La priorité est par profil, pas une propriété de la file seule.",
      "Un contact peut rester dans une file hors horaires si vous n'avez jamais vérifié les horaires.",
      "Les rappels occupent encore la logique de la file. Ils ont besoin d'un profil pourvu.",
      "Nommez les files d'après le travail, pas d'après une personne.",
    ],
    mistake: "Construire une file par agent.",
  },
  de: {
    why: "Eine Queue, die in niemandes Profil steht, ist ein stiller Parkplatz.",
    paras: [
      "Sie legen eine Queue an, hängen Stunden, eine ausgehende Anrufer-ID und optionale Quick Connects an. Arbeitsqueue festlegen wählt sie. Transfer zur Queue legt den Kontakt ab. Der Standard ist 100 Queues und 50 Queue-Kanal-Kombinationen je Routing-Profil.",
      "Agentenqueues sind für Transfers an eine Person. Die Standardgrenze ist 10 wartende Kontakte in einer Agentenqueue.",
    ],
    points: [
      "Priorität gilt je Profil, nicht als Eigenschaft der Queue allein.",
      "Ein Kontakt kann außerhalb der Stunden in einer Queue sitzen, wenn die Stunden nie geprüft wurden.",
      "Rückrufe belegen weiter die Logik der Queue. Sie brauchen ein besetztes Profil.",
      "Queues nach der Arbeit benennen, nicht nach einer Person.",
    ],
    mistake: "Eine Queue pro Agent bauen.",
  },
  ja: {
    why: "どのプロファイルにも入っていないキューは、静かな駐車場です。",
    paras: [
      "キューを作り、営業時間、発信者番号、任意のクイックコネクトを付けます。作業キューの設定がそれを選びます。キューへの転送がコンタクトを置きます。既定はキュー 100、ルーティングプロファイルあたりキューとチャネルの組み合わせ 50 です。",
      "エージェントキューは人への転送用です。既定の上限は 1 つのエージェントキューで待つコンタクト 10 です。",
    ],
    points: [
      "優先度はプロファイルごとで、キューだけの性質ではありません。",
      "営業時間を確認しなければ、時間外のキューにコンタクトが残り得ます。",
      "コールバックもキューの論理を使います。人が入ったプロファイルが要ります。",
      "キューは仕事の名前にし、人の名前にはしません。",
    ],
    mistake: "エージェントごとにキューを作ること。",
  },
  hi: {
    why: "ऐसी कतार जिसमें किसी का प्रोफ़ाइल उसे शामिल न करे, मौन पार्किंग है।",
    paras: [
      "कतार बनाते हैं, घंटे, जावक कॉलर पहचान और वैकल्पिक त्वरित कनेक्ट लगाते हैं। कार्य कतार सेट करना उसे चुनता है। कतार में स्थानांतरण संपर्क रखता है। डिफ़ॉल्ट 100 कतारें और प्रति रूटिंग प्रोफ़ाइल 50 कतार-चैनल संयोजन हैं।",
      "एजेंट कतारें व्यक्ति को स्थानांतरण के लिए हैं। डिफ़ॉल्ट सीमा एक एजेंट कतार पर 10 प्रतीक्षारत संपर्क है।",
    ],
    points: [
      "प्राथमिकता प्रोफ़ाइल के अनुसार है, केवल कतार का गुण नहीं।",
      "यदि घंटे कभी नहीं जाँचे तो संपर्क घंटों के बाहर कतार में बैठ सकता है।",
      "कॉलबैक फिर भी कतार का तर्क घेरते हैं। उन्हें स्टाफ़ वाला प्रोफ़ाइल चाहिए।",
      "कतारों का नाम काम पर रखें, व्यक्ति पर नहीं।",
    ],
    mistake: "प्रति एजेंट एक कतार बनाना।",
  },
  te: {
    why: "ఎవరి ప్రొఫైల్‌లో లేని క్యూ నిశ్శబ్ద పార్కింగ్.",
    paras: [
      "క్యూ సృష్టించి, గంటలు, అవుట్‌బౌండ్ కాలర్ ఐడి, ఐచ్ఛిక క్విక్ కనెక్ట్‌లు అమర్చండి. వర్కింగ్ క్యూ సెట్ చేయడం దాన్ని ఎంచుకుంటుంది. క్యూకు బదిలీ కాంటాక్ట్‌ను ఉంచుతుంది. డిఫాల్ట్ 100 క్యూలు మరియు రూటింగ్ ప్రొఫైల్‌కు 50 క్యూ-ఛానల్ కలయికలు.",
      "ఏజెంట్ క్యూలు వ్యక్తికి బదిలీల కోసం. డిఫాల్ట్ పరిమితి ఒక ఏజెంట్ క్యూపై 10 వేచి ఉన్న కాంటాక్ట్‌లు.",
    ],
    points: [
      "ప్రాధాన్యత ప్రొఫైల్ ప్రకారం, క్యూ ఒంటరిగా లక్షణం కాదు.",
      "గంటలు ఎప్పుడూ చూడకపోతే కాంటాక్ట్ గంటల వెలుపల క్యూలో కూర్చోవచ్చు.",
      "కాల్‌బ్యాక్‌లు ఇంకా క్యూ తర్కాన్ని ఆక్రమిస్తాయి. సిబ్బంది ఉన్న ప్రొఫైల్ కావాలి.",
      "క్యూలకు పని పేరు పెట్టండి, వ్యక్తి పేరు కాదు.",
    ],
    mistake: "ప్రతి ఏజెంట్‌కు ఒక క్యూ కట్టడం.",
  },
  ar: {
    why: "طابور لا يشمله ملف أي شخص هو موقف صامت.",
    paras: [
      "تنشئ طابورًا، وتربط ساعات ومعرّف متصل صادر واتصالات سريعة اختيارية. تعيين طابور العمل يختاره. التحويل إلى الطابور يضع الجهة. الافتراضي 100 طابور و50 تركيبة طابور-قناة لكل ملف توجيه.",
      "طوابير الوكيل للتحويل إلى شخص. السقف الافتراضي 10 جهات تنتظر على طابور وكيل واحد.",
    ],
    points: [
      "الأولوية لكل ملف، ليست خاصية للطابور وحده.",
      "قد تجلس جهة في طابور خارج الساعات إذا لم تُفحص الساعات قط.",
      "معاودات الاتصال ما زالت تشغل منطق الطابور. تحتاج ملفًا فيه موظفون.",
      "سمِّ الطوابير بالعمل، لا بشخص.",
    ],
    mistake: "بناء طابور لكل وكيل.",
  },
});

put("ws-ccp", {
  es: {
    why: "El inicio de sesión puede funcionar cuando el medio no. Son listas de permiso distintas.",
    paras: [
      "La señalización y la interfaz usan TCP 443 hacia la instancia, CloudFront y los dominios de transporte. El medio usa UDP 3478 hacia TurnNlb. La documentación recomienda la opción 1, la lista de dominios, y pide probar más de 200 llamadas.",
      "VDI y VPN son las razones habituales de que un laboratorio funcione y la sala no. El medio debe ir directo a AWS.",
    ],
    points: [
      "Solo navegadores admitidos. Un navegador cerrado sin permisos WebRTC falla cerrado.",
      "Unos auriculares con su propio DSP pueden ir bien. El permiso del micrófono en el navegador no es opcional.",
      "La herramienta de conectividad de extremos es la primera prueba, antes de una captura de paquetes.",
      "Los firewalls sin estado necesitan el UDP efímero de vuelta.",
    ],
    mistake: "Culpar al operador de un softphone que nunca estableció ICE.",
  },
  fr: {
    why: "La connexion peut réussir quand le média échoue. Ce sont des listes d'autorisation différentes.",
    paras: [
      "La signalisation et l'interface utilisent TCP 443 vers l'instance, CloudFront et les domaines de transport. Le média utilise UDP 3478 vers TurnNlb. La documentation recommande l'option 1, la liste de domaines, et demande de tester plus de 200 appels.",
      "VDI et VPN sont les raisons habituelles qu'un labo marche et que le plateau non. Le média doit aller directement vers AWS.",
    ],
    points: [
      "Navigateurs pris en charge seulement. Un navigateur verrouillé sans permissions WebRTC échoue fermé.",
      "Un casque avec son propre DSP peut aller. La permission micro du navigateur n'est pas facultative.",
      "L'outil de connectivité des points de terminaison est le premier test, avant une capture de paquets.",
      "Les pare-feu sans état ont besoin de l'UDP éphémère en retour.",
    ],
    mistake: "Blâmer l'opérateur pour un softphone qui n'a jamais établi ICE.",
  },
  de: {
    why: "Die Anmeldung kann gelingen, wenn Medien scheitern. Das sind verschiedene Freigabelisten.",
    paras: [
      "Signalisierung und Oberfläche nutzen TCP 443 zur Instanz, zu CloudFront und zu den Transport-Domänen. Medien nutzen UDP 3478 zu TurnNlb. Die Dokumentation empfiehlt Option 1, die Domänenliste, und bittet um mehr als 200 Testanrufe.",
      "VDI und VPN sind die üblichen Gründe, warum ein Labor geht und der Boden nicht. Medien sollen direkt zu AWS.",
    ],
    points: [
      "Nur unterstützte Browser. Ein gesperrter Browser ohne WebRTC-Rechte fällt zu.",
      "Headsets mit eigenem DSP können in Ordnung sein. Die Mikrofonfreigabe im Browser ist nicht optional.",
      "Das Endpoint-Connectivity-Werkzeug ist der erste Test, vor einer Paketaufzeichnung.",
      "Zustandslose Firewalls brauchen ephemeres UDP zurück.",
    ],
    mistake: "Den Carrier beschuldigen, obwohl das Softphone nie ICE aufgebaut hat.",
  },
  ja: {
    why: "サインインは成功してメディアは失敗し得ます。許可リストが違います。",
    paras: [
      "シグナリングと UI はインスタンス、CloudFront、トランスポートのドメインへ TCP 443 を使います。メディアは TurnNlb へ UDP 3478 です。文書はオプション 1、ドメイン一覧を勧め、200 通話を超える試験を求めます。",
      "VDI と VPN は、実験室では動いて現場では動かない典型です。メディアは AWS へ直接行くべきです。",
    ],
    points: [
      "対応ブラウザだけです。WebRTC の許可がないロックされたブラウザは閉じた失敗になります。",
      "独自 DSP のヘッドセットでも構いません。ブラウザのマイク許可は任意ではありません。",
      "エンドポイント接続ツールが最初の試験で、パケットキャプチャの前です。",
      "ステートレスなファイアウォールには戻りの一時 UDP が要ります。",
    ],
    mistake: "ICE を確立しなかったソフトフォンをキャリアのせいにすること。",
  },
  hi: {
    why: "साइन-इन तब सफल हो सकता है जब मीडिया न हो। वे अलग अनुमति सूचियाँ हैं।",
    paras: [
      "सिग्नलिंग और इंटरफ़ेस इंस्टेंस, CloudFront और परिवहन डोमेन की ओर TCP 443 उपयोग करते हैं। मीडिया TurnNlb की ओर UDP 3478 उपयोग करता है। दस्तावेज़ विकल्प 1, डोमेन सूची, सुझाते हैं और 200 से अधिक कॉल जाँचने को कहते हैं।",
      "VDI और VPN सामान्य कारण हैं कि प्रयोगशाला चले और फ़र्श न चले। मीडिया सीधे AWS जाना चाहिए।",
    ],
    points: [
      "केवल समर्थित ब्राउज़र। WebRTC अनुमति के बिना बंद ब्राउज़र बंद विफल होता है।",
      "अपने DSP वाले हेडसेट ठीक हो सकते हैं। ब्राउज़र में माइक्रोफ़ोन अनुमति वैकल्पिक नहीं।",
      "एंडपॉइंट कनेक्टिविटी उपकरण पहली जाँच है, पैकेट कैप्चर से पहले।",
      "स्थिति-रहित फ़ायरवॉल को लौटता क्षणिक UDP चाहिए।",
    ],
    mistake: "ऐसे सॉफ़्टफ़ोन के लिए कैरियर को दोष देना जिसने कभी ICE स्थापित नहीं किया।",
  },
  te: {
    why: "మీడియా విఫలమైనా సైన్-ఇన్ విజయవంతం కావచ్చు. అవి వేరు అనుమతి జాబితాలు.",
    paras: [
      "సిగ్నలింగ్ మరియు UI ఇన్‌స్టాన్స్, CloudFront, రవాణా డొమైన్‌లకు TCP 443 వాడతాయి. మీడియా TurnNlb కు UDP 3478. పత్రాలు ఎంపిక 1, డొమైన్ జాబితాను సిఫార్సు చేసి 200 కంటే ఎక్కువ కాల్‌లు పరీక్షించమంటాయి.",
      "VDI మరియు VPN ప్రయోగశాల పనిచేసి అంతస్తు పనిచేయకపోవడానికి సాధారణ కారణాలు. మీడియా నేరుగా AWS కు వెళ్లాలి.",
    ],
    points: [
      "మద్దతు ఉన్న బ్రౌజర్‌లు మాత్రమే. WebRTC అనుమతులు లేని మూసిన బ్రౌజర్ మూసి విఫలమవుతుంది.",
      "స్వంత DSP ఉన్న హెడ్‌సెట్‌లు సరే కావచ్చు. బ్రౌజర్ మైక్రోఫోన్ అనుమతి ఐచ్ఛికం కాదు.",
      "ఎండ్‌పాయింట్ కనెక్టివిటీ సాధనం మొదటి పరీక్ష, ప్యాకెట్ క్యాప్చర్ ముందు.",
      "స్థితిలేని ఫైర్‌వాల్‌లకు తిరిగి వచ్చే తాత్కాలిక UDP కావాలి.",
    ],
    mistake: "ICE ఏర్పాటు చేయని సాఫ్ట్‌ఫోన్‌కు క్యారియర్‌ను నిందించడం.",
  },
  ar: {
    why: "قد ينجح تسجيل الدخول حين يفشل الوسيط. قائمتا السماح مختلفتان.",
    paras: [
      "الإشارة والواجهة تستخدمان TCP 443 إلى المثيل وCloudFront ونطاقات النقل. الوسيط يستخدم UDP 3478 إلى TurnNlb. الوثائق توصي بالخيار 1، قائمة النطاقات، وتطلب اختبار أكثر من 200 مكالمة.",
      "VDI وVPN هما السبب المعتاد لنجاح المختبر وفشل القاعة. الوسيط يجب أن يذهب مباشرة إلى AWS.",
    ],
    points: [
      "متصفحات مدعومة فقط. متصفح مقفل بلا أذونات WebRTC يفشل مغلقًا.",
      "سماعة بمعالجها قد تكون جيدة. إذن الميكروفون في المتصفح ليس اختياريًا.",
      "أداة اتصال نقاط النهاية هي الاختبار الأول، قبل التقاط الحزم.",
      "جدران الحماية بلا حالة تحتاج UDP العابر عائدًا.",
    ],
    mistake: "لوم الناقل على هاتف برمجي لم يُقم ICE قط.",
  },
});

put("rec-profiles", {
  es: {
    why: "El contacto termina. El perfil es cómo el siguiente contacto sabe quién llamó.",
    paras: [
      "Customer Profiles guarda al cliente y los objetos que adjuntas. Los perfiles solo de Connect se cobran a 0 USD por uso diario en el apéndice. En el momento en que fusionas datos de CRM importados, el uso diario de ese perfil es 0,005 USD, con cargos extra pasados cada 100 objetos, y un tope descrito en el apéndice.",
      "El bloque del flujo puede obtener, crear y actualizar un perfil. La resolución de identidad decide cuándo dos registros son una persona. Si esa regla falla, los agentes ven dos medios clientes.",
    ],
    points: [
      "Las claves de un tipo de objeto son 10 por defecto.",
      "Un objeto de perfil llega a 250 KB en la tabla de cuotas. Todos los objetos de un perfil comparten un tope mayor.",
      "Los atributos calculados y los disparadores de eventos tienen sus propias cuotas.",
      "Las direcciones E911 de los agentes se guardan aquí a propósito. Es otra población de perfiles, distinta de los clientes. No mezcles las reglas de coincidencia a la ligera.",
    ],
    mistake: "Usar el número de teléfono como única clave cuando los clientes comparten una línea de casa.",
  },
  fr: {
    why: "Le contact se termine. Le profil est comment le contact suivant sait qui a appelé.",
    paras: [
      "Customer Profiles stocke le client et les objets que vous attachez. Les profils uniquement Connect sont à 0 USD par usage quotidien dans l'annexe. Dès que vous fusionnez des données CRM importées, l'usage quotidien de ce profil est 0,005 USD, avec des frais au-delà de chaque 100 objets, et un plafond décrit dans l'annexe.",
      "Le bloc du flux peut lire, créer et mettre à jour un profil. La résolution d'identité décide quand deux enregistrements sont une personne. Une mauvaise règle montre deux demi-clients aux agents.",
    ],
    points: [
      "Les clés d'un type d'objet sont à 10 par défaut.",
      "Un objet de profil plafonne à 250 Ko dans la table des quotas. Tous les objets d'un profil partagent un plafond plus large.",
      "Les attributs calculés et les déclencheurs d'événements ont leurs propres quotas.",
      "Les adresses E911 des agents sont stockées ici exprès. C'est une autre population que les clients. Ne mélangez pas les règles de correspondance à la légère.",
    ],
    mistake: "Utiliser le numéro de téléphone comme seule clé quand les clients partagent une ligne de foyer.",
  },
  de: {
    why: "Der Kontakt endet. Das Profil ist, wie der nächste Kontakt weiß, wer angerufen hat.",
    paras: [
      "Customer Profiles speichert den Kunden und die angehängten Objekte. Nur-Connect-Profile kosten im Anhang 0 USD pro täglicher Nutzung. Sobald importierte CRM-Daten zusammengeführt werden, kostet die tägliche Nutzung dieses Profils 0,005 USD, mit Zusatzgebühren jenseits von je 100 Objekten, und einer im Anhang beschriebenen Obergrenze.",
      "Der Flow-Block kann ein Profil lesen, anlegen und ändern. Identity Resolution entscheidet, wann zwei Datensätze eine Person sind. Eine falsche Regel zeigt Agenten zwei halbe Kunden.",
    ],
    points: [
      "Schlüssel eines Objekttyps sind standardmäßig 10.",
      "Ein Profilobjekt endet in der Quotentabelle bei 250 KB. Alle Objekte eines Profils teilen eine größere Obergrenze.",
      "Berechnete Attribute und Ereignisauslöser haben eigene Kontingente.",
      "E911-Adressen der Agenten liegen hier absichtlich. Das ist eine andere Profilmenge als Kunden. Die Abgleichregeln nicht leichtfertig mischen.",
    ],
    mistake: "Die Telefonnummer als einzigen Schlüssel nutzen, wenn Kunden eine Haushaltsleitung teilen.",
  },
  ja: {
    why: "コンタクトは終わります。次のコンタクトが誰からかを知るのがプロファイルです。",
    paras: [
      "Customer Profiles は顧客と、付けたオブジェクトを保存します。Connect だけのプロファイルは付録で 1 日の利用 0 USD です。取り込んだ CRM データを結合した瞬間、そのプロファイルの 1 日の利用は 0.005 USD で、オブジェクト 100 を超えると追加料金があり、上限は付録にあります。",
      "フローのブロックはプロファイルの取得、作成、更新ができます。ID 解決は二つの記録が一人かを決めます。その規則を誤ると、エージェントは半分ずつの顧客を二つ見ます。",
    ],
    points: [
      "オブジェクト型のキーは既定で 10 です。",
      "プロファイルオブジェクトはクォータ表で最大 250 KB です。一つのプロファイルの全オブジェクトはより大きい上限を共有します。",
      "計算属性とイベントトリガーには別のクォータがあります。",
      "エージェントの E911 住所は意図してここに保存されます。顧客とは別のプロファイル集団です。照合規則を不用意に混ぜないでください。",
    ],
    mistake: "顧客が家庭の回線を共有するのに、電話番号だけをキーにすること。",
  },
  hi: {
    why: "संपर्क समाप्त होता है। प्रोफ़ाइल बताती है कि अगले संपर्क को कौन बुलाया।",
    paras: [
      "Customer Profiles ग्राहक और जोड़ी वस्तुएँ रखता है। केवल-Connect प्रोफ़ाइल परिशिष्ट में दैनिक उपयोग 0 USD हैं। आयातित CRM डेटा मिलाते ही उस प्रोफ़ाइल का दैनिक उपयोग 0.005 USD है, प्रत्येक 100 वस्तुओं के बाद अतिरिक्त शुल्क, और परिशिष्ट में वर्णित सीमा।",
      "फ़्लो ब्लॉक प्रोफ़ाइल पा, बना और बदल सकता है। पहचान समाधान तय करता है कि दो अभिलेख एक व्यक्ति कब हैं। नियम ग़लत हो तो एजेंट दो आधे ग्राहक देखते हैं।",
    ],
    points: [
      "वस्तु प्रकार की कुंजियाँ डिफ़ॉल्ट 10 हैं।",
      "प्रोफ़ाइल वस्तु कोटा तालिका में अधिकतम 250 KB। एक प्रोफ़ाइल की सभी वस्तुएँ बड़ी सीमा बाँटती हैं।",
      "गणना किए गुण और घटना ट्रिगर के अपने कोटे हैं।",
      "एजेंटों के E911 पते यहाँ जानबूझकर रहते हैं। वह ग्राहकों से अलग प्रोफ़ाइल जनसंख्या है। मिलान नियम लापरवाही से न मिलाएँ।",
    ],
    mistake: "जब ग्राहक घरेलू लाइन बाँटें तब फ़ोन नंबर को एकमात्र कुंजी बनाना।",
  },
  te: {
    why: "కాంటాక్ట్ ముగుస్తుంది. తర్వాతి కాంటాక్ట్ ఎవరు కాల్ చేశారో ప్రొఫైల్ చెబుతుంది.",
    paras: [
      "Customer Profiles కస్టమర్‌ను మరియు మీరు జోడించిన వస్తువులను నిల్వ చేస్తుంది. Connect-మాత్రమే ప్రొఫైల్‌లు అనుబంధంలో రోజువారీ వాడకానికి 0 USD. దిగుమతి CRM డేటా కలిపిన క్షణం ఆ ప్రొఫైల్ రోజువారీ వాడకం 0.005 USD, ప్రతి 100 వస్తువుల తర్వాత అదనపు ఛార్జీలు, పరిమితి అనుబంధంలో ఉంది.",
      "ఫ్లో బ్లాక్ ప్రొఫైల్ పొందగలదు, సృష్టించగలదు, నవీకరించగలదు. గుర్తింపు పరిష్కారం రెండు రికార్డులు ఒక వ్యక్తి ఎప్పుడో నిర్ణయిస్తుంది. ఆ నియమం తప్పితే ఏజెంట్లు రెండు సగం కస్టమర్‌లను చూస్తారు.",
    ],
    points: [
      "వస్తువు రకం కీలు డిఫాల్ట్ 10.",
      "ప్రొఫైల్ వస్తువు కోటా పట్టికలో గరిష్ఠం 250 KB. ఒక ప్రొఫైల్ వస్తువులన్నీ పెద్ద పరిమితి పంచుకుంటాయి.",
      "లెక్కించిన లక్షణాలు మరియు ఈవెంట్ ట్రిగ్గర్‌లకు స్వంత కోటాలు.",
      "ఏజెంట్ E911 చిరునామాలు ఇక్కడ ఉద్దేశపూర్వకంగా నిల్వ. అది కస్టమర్‌లకు వేరు ప్రొఫైల్ జనాభా. సరిపోలిక నియమాలను అజాగ్రత్తగా కలపకండి.",
    ],
    mistake: "కస్టమర్‌లు ఇంటి లైన్ పంచుకున్నప్పుడు ఫోన్ నంబర్‌నే ఏకైక కీగా వాడటం.",
  },
  ar: {
    why: "تنتهي الجهة. الملف هو كيف تعرف الجهة التالية من اتصل.",
    paras: [
      "Customer Profiles يخزّن العميل والكائنات التي ترفقها. ملفات Connect فقط بسعر 0 USD للاستخدام اليومي في الملحق. لحظة دمج بيانات CRM مستوردة يصير الاستخدام اليومي لذلك الملف 0.005 USD، مع رسوم إضافية بعد كل 100 كائن، وسقف موصوف في الملحق.",
      "كتلة التدفق تستطيع جلب ملف وإنشاءه وتحديثه. حل الهوية يقرر متى يكون سجلان شخصًا واحدًا. قاعدة خاطئة تُري الوكلاء عميلين نصفين.",
    ],
    points: [
      "مفاتيح نوع الكائن افتراضيًا 10.",
      "كائن الملف يبلغ 250 KB في جدول الحصص. كل كائنات ملف واحد تشترك في سقف أكبر.",
      "السمات المحسوبة ومشغلات الأحداث لها حصصها.",
      "عناوين E911 للوكلاء تُخزَّن هنا عمدًا. تلك جمهرة ملفات غير العملاء. لا تخلط قواعد المطابقة باستخفاف.",
    ],
    mistake: "استخدام رقم الهاتف المفتاح الوحيد حين يشارك العملاء خط منزل.",
  },
});

put("ch-chat", {
  es: {
    why: "Un chat que se ha quedado en silencio sigue siendo un chat activo. El techo por defecto es 500, compartido con SMS, WhatsApp y Apple Messages for Business.",
    paras: [
      "Connect Customer cobra un mensaje de chat a 0,010 USD enviado o recibido, y el ejemplo trabajado cuenta las preguntas del responsable y las respuestas de la IA como mensajes. SMS y mensajería de terceros son 0,014 USD por mensaje antes de la tarifa de entrega del proveedor. Los precios básicos son más bajos y van aparte.",
      "El chat persistente es la forma documentada de no contar un silencio largo contra la cuota. Los orígenes del widget deben estar permitidos o el navegador no inicia la sesión.",
    ],
    points: [
      "StartChatContact es una API. Llámalo desde tu backend.",
      "La misma cola y el mismo perfil de enrutamiento pueden incluir chat con su propia concurrencia.",
      "Los adjuntos y los mensajes enriquecidos tienen límites de tamaño. Los adjuntos de correo son otro canal.",
      "Alarma en chats concurrentes al 80 por ciento.",
    ],
    mistake: "Probar carga del widget desde un portátil y llamar a eso planificación de capacidad.",
  },
  fr: {
    why: "Un chat devenu silencieux reste un chat actif. Le plafond par défaut est 500, partagé avec SMS, WhatsApp et Apple Messages for Business.",
    paras: [
      "Connect Customer facture un message de chat à 0,010 USD envoyé ou reçu, et l'exemple travaillé compte les questions du responsable et les réponses de l'IA comme messages. SMS et messagerie tierce sont à 0,014 USD par message avant les frais de remise du fournisseur. Les prix de base sont plus bas et listés à part.",
      "Le chat persistant est le moyen documenté d'éviter de compter un long silence dans le quota. Les origines du widget doivent être autorisées sinon le navigateur ne démarre pas la session.",
    ],
    points: [
      "StartChatContact est une API. Appelez-la depuis votre backend.",
      "La même file et le même profil peuvent inclure le chat avec sa propre simultanéité.",
      "Pièces jointes et messages riches ont des limites de taille. Les pièces d'e-mail sont un autre canal.",
      "Alertez les chats simultanés à 80 pour cent.",
    ],
    mistake: "Charger le widget depuis un portable et appeler cela un plan de capacité.",
  },
  de: {
    why: "Ein stiller Chat ist weiter ein aktiver Chat. Die Standarddecke ist 500, geteilt mit SMS, WhatsApp und Apple Messages for Business.",
    paras: [
      "Connect Customer berechnet eine Chat-Nachricht mit 0,010 USD gesendet oder empfangen, und das Beispiel zählt Fragen der Führung und KI-Antworten als Nachrichten. SMS und Dritt-Nachrichten sind 0,014 USD je Nachricht vor der Zustellgebühr des Anbieters. Basispreise sind niedriger und stehen extra.",
      "Persistenter Chat ist der dokumentierte Weg, langes Schweigen nicht gegen das Kontingent zu zählen. Widget-Origins müssen erlaubt sein, sonst startet der Browser die Sitzung nicht.",
    ],
    points: [
      "StartChatContact ist eine API. Vom Backend aufrufen.",
      "Dieselbe Queue und dasselbe Routing-Profil können Chat mit eigener Gleichzeitigkeit enthalten.",
      "Anhänge und Rich Messages haben Größengrenzen. E-Mail-Anhänge sind ein anderer Kanal.",
      "Bei gleichzeitigen Chats bei 80 Prozent alarmieren.",
    ],
    mistake: "Das Widget vom Laptop aus lasttesten und das Kapazitätsplanung nennen.",
  },
  ja: {
    why: "静かになったチャットもアクティブなチャットです。既定の上限は 500 で、SMS、WhatsApp、Apple Messages for Business と共有します。",
    paras: [
      "Connect Customer はチャットメッセージを送受信 0.010 USD で、計算例は管理者の質問と AI の返答もメッセージに数えます。SMS と第三者メッセージは提供者の配信料の前に 1 通 0.014 USD です。基本価格はより低く、別に載っています。",
      "永続チャットは長い沈黙をクォータに数えない文書化された方法です。ウィジェットのオリジンを許可しないとブラウザはセッションを始めません。",
    ],
    points: [
      "StartChatContact は API です。バックエンドから呼びます。",
      "同じキューとルーティングプロファイルに、独自の同時数のチャットを含められます。",
      "添付とリッチメッセージには大きさの制限があります。メール添付は別チャネルです。",
      "同時チャットは 80 パーセントで警報します。",
    ],
    mistake: "ノート PC からウィジェットを負荷試験して、それを容量計画と呼ぶこと。",
  },
  hi: {
    why: "शांत पड़ा चैट फिर भी सक्रिय चैट है। डिफ़ॉल्ट छत 500 है, SMS, WhatsApp और Apple Messages for Business के साथ साझा।",
    paras: [
      "Connect Customer चैट संदेश भेजा या प्राप्त 0.010 USD लेता है, और काम किया उदाहरण प्रबंधक के प्रश्न और AI उत्तरों को संदेश गिनता है। SMS और तृतीय-पक्ष संदेश प्रदाता की डिलीवरी फ़ीस से पहले 0.014 USD प्रति संदेश हैं। मूल मूल्य कम हैं और अलग सूचीबद्ध।",
      "स्थायी चैट लंबी चुप्पी को कोटे में न गिनने का दस्तावेज़ी तरीका है। विजेट मूल अनुमत होने चाहिए वरना ब्राउज़र सत्र शुरू नहीं करता।",
    ],
    points: [
      "StartChatContact एक API है। अपने बैकएंड से बुलाएँ।",
      "वही कतार और रूटिंग प्रोफ़ाइल अपनी समवर्तिता के साथ चैट शामिल कर सकते हैं।",
      "संलग्नक और समृद्ध संदेशों की आकार सीमा है। ईमेल संलग्नक दूसरा चैनल है।",
      "समवर्ती चैट पर 80 प्रतिशत पर अलार्म।",
    ],
    mistake: "लैपटॉप से विजेट का भार-परीक्षण करके उसे क्षमता योजना कहना।",
  },
  te: {
    why: "నిశ్శబ్దమైన చాట్ ఇంకా క్రియాశీల చాట్. డిఫాల్ట్ పైకప్పు 500, SMS, WhatsApp, Apple Messages for Business తో పంచుకుంటుంది.",
    paras: [
      "Connect Customer చాట్ సందేశాన్ని పంపినా స్వీకరించినా 0.010 USD. ఉదాహరణ మేనేజర్ ప్రశ్నలు మరియు AI సమాధానాలను సందేశాలుగా లెక్కిస్తుంది. SMS మరియు మూడవ పక్ష సందేశాలు ప్రొవైడర్ డెలివరీ రుసుముకు ముందు సందేశానికి 0.014 USD. ప్రాథమిక ధరలు తక్కువ, వేరుగా ఉన్నాయి.",
      "నిరంతర చాట్ సుదీర్ఘ నిశ్శబ్దాన్ని కోటాలో లెక్కించకుండా ఉండే డాక్యుమెంట్ మార్గం. విడ్జెట్ ఆరిజిన్‌లు అనుమతించాలి, లేకపోతే బ్రౌజర్ సెషన్ మొదలుపెట్టదు.",
    ],
    points: [
      "StartChatContact ఒక API. మీ బ్యాకెండ్ నుండి పిలవండి.",
      "అదే క్యూ మరియు రూటింగ్ ప్రొఫైల్ స్వంత ఏకకాలంతో చాట్ చేర్చవచ్చు.",
      "అటాచ్‌మెంట్‌లు మరియు రిచ్ సందేశాలకు పరిమాణ పరిమితులు. ఈమెయిల్ అటాచ్‌మెంట్‌లు వేరు ఛానల్.",
      "ఏకకాల చాట్‌లపై 80 శాతం వద్ద అలారం.",
    ],
    mistake: "ల్యాప్‌టాప్ నుండి విడ్జెట్ లోడ్ పరీక్షించి దాన్ని సామర్థ్య ప్రణాళిక అనడం.",
  },
  ar: {
    why: "دردشة هدأت ما زالت دردشة نشطة. السقف الافتراضي 500، مشترك مع SMS وWhatsApp وApple Messages for Business.",
    paras: [
      "Connect Customer يحسب رسالة دردشة 0.010 USD مرسلة أو مستلمة، والمثال يحسب أسئلة المدير وردود الذكاء رسائل. SMS ورسائل الطرف الثالث 0.014 USD للرسالة قبل رسم التسليم. الأسعار الأساسية أقل ومدرجة على حدة.",
      "الدردشة الدائمة هي الطريقة الموثقة لتجنب عد الصمت الطويل على الحصة. أصول الأداة يجب أن تُسمح وإلا لن يبدأ المتصفح الجلسة.",
    ],
    points: [
      "StartChatContact واجهة. نادها من خلفيتك.",
      "الطابور وملف التوجيه نفسهما يمكن أن يشملا الدردشة بتزامنها.",
      "المرفقات والرسائل الغنية لها حدود حجم. مرفقات البريد قناة أخرى.",
      "أنذر الدردشات المتزامنة عند 80 بالمئة.",
    ],
    mistake: "اختبار حمل الأداة من حاسوب محمول وتسمية ذلك تخطيط سعة.",
  },
});

put("an-ctr", {
  es: {
    why: "El CTR es el contacto terminado. Las métricas en tiempo real son una foto del ahora. Responden preguntas distintas.",
    paras: [
      "Campos que deberías poder señalar: ContactId, Channel, InitiationMethod, los extremos, la duración en cola, las marcas de tiempo del agente, ACW, el motivo de desconexión, los atributos y la ubicación de la grabación. Las transferencias crean otro contacto. PreviousContactId y NextContactId son la cadena.",
      "La entrega a Firehose o a un stream es casi en tiempo real y puede duplicar. Los consumidores deben ser idempotentes. Cinco minutos de silencio es cuando miras el prefijo de error.",
    ],
    points: [
      "DisconnectReason es el primer campo cuando alguien dice que el operador cortó la llamada.",
      "Los atributos son lo que escribiste. No son infinitos.",
      "Una Recording.Location ausente significa que la grabación estaba apagada o la escritura falló.",
      "No promedies un día a partir de capturas de tiempo real.",
    ],
    mistake: "Construir una tabla de almacén que solo guarda el último contacto de una cadena de transferencias.",
  },
  fr: {
    why: "Le CTR est le contact terminé. Les métriques temps réel sont une photo du présent. Elles répondent à d'autres questions.",
    paras: [
      "Champs que vous devez pouvoir montrer : ContactId, Channel, InitiationMethod, les extrémités, la durée de file, les horodatages agent, ACW, la raison de déconnexion, les attributs et l'emplacement de l'enregistrement. Les transferts créent un autre contact. PreviousContactId et NextContactId sont la chaîne.",
      "La livraison vers Firehose ou un flux est quasi temps réel et peut dupliquer. Les consommateurs doivent être idempotents. Cinq minutes de silence, c'est quand on regarde le préfixe d'erreur.",
    ],
    points: [
      "DisconnectReason est le premier champ quand quelqu'un dit que l'opérateur a coupé.",
      "Les attributs sont ce que vous avez écrit. Ils ne sont pas infinis.",
      "Une Recording.Location absente veut dire enregistrement éteint ou écriture échouée.",
      "Ne moyennez pas une journée à partir de captures temps réel.",
    ],
    mistake: "Construire une table d'entrepôt qui ne garde que le dernier contact d'une chaîne de transferts.",
  },
  de: {
    why: "Der CTR ist der fertige Kontakt. Echtzeitmetriken sind ein Bild von jetzt. Sie beantworten andere Fragen.",
    paras: [
      "Felder, auf die Sie zeigen können sollten: ContactId, Channel, InitiationMethod, die Endpunkte, Queuedauer, Agenten-Zeitstempel, ACW, Disconnect-Grund, Attribute und der Aufnahmeort. Transfers erzeugen einen weiteren Kontakt. PreviousContactId und NextContactId sind die Kette.",
      "Lieferung an Firehose oder einen Stream ist nahezu Echtzeit und kann duplizieren. Verbraucher müssen idempotent sein. Fünf Minuten Stille ist der Moment für das Fehlerpräfix.",
    ],
    points: [
      "DisconnectReason ist das erste Feld, wenn jemand sagt, der Carrier habe aufgelegt.",
      "Attribute sind das, was Sie geschrieben haben. Sie sind nicht unendlich.",
      "Eine fehlende Recording.Location heißt Aufnahme aus oder Schreibfehler.",
      "Einen Tag nicht aus Echtzeit-Screenshots mitteln.",
    ],
    mistake: "Eine Warehouse-Tabelle bauen, die nur den letzten Kontakt einer Transferkette behält.",
  },
  ja: {
    why: "CTR は終わったコンタクトです。リアルタイム指標は今の写真です。問いに答えるものが違います。",
    paras: [
      "指させるべき項目: ContactId、Channel、InitiationMethod、端点、キュー時間、エージェントの時刻、ACW、切断理由、属性、録音の場所。転送は別のコンタクトを作ります。PreviousContactId と NextContactId が鎖です。",
      "Firehose やストリームへの配送はほぼリアルタイムで重複し得ます。消費者は冪等であるべきです。5 分の沈黙はエラー接頭辞を見るときです。",
    ],
    points: [
      "キャリアが切ったと言うとき、最初の項目は DisconnectReason です。",
      "属性はあなたが書いたものです。無限ではありません。",
      "Recording.Location が無いのは録音オフか書き込み失敗です。",
      "リアルタイムの画面から一日を平均しないでください。",
    ],
    mistake: "転送の鎖の最後のコンタクトだけを残す倉庫テーブルを作ること。",
  },
  hi: {
    why: "CTR समाप्त संपर्क है। वास्तविक-समय माप अभी की तस्वीर हैं। वे अलग प्रश्न का उत्तर देते हैं।",
    paras: [
      "जिन क्षेत्रों की ओर इशारा कर सकें: ContactId, Channel, InitiationMethod, छोर, कतार अवधि, एजेंट समय-चिह्न, ACW, डिस्कनेक्ट कारण, गुण, और रिकॉर्डिंग स्थान। स्थानांतरण दूसरा संपर्क बनाते हैं। PreviousContactId और NextContactId श्रृंखला हैं।",
      "Firehose या स्ट्रीम को वितरण लगभग वास्तविक समय है और दोहरा सकता है। उपभोक्ता पुनरावृत्ति-सह होने चाहिए। पाँच मिनट की चुप्पी वह समय है जब त्रुटि उपसर्ग देखें।",
    ],
    points: [
      "जब कोई कहे कैरियर ने काटा, पहला क्षेत्र DisconnectReason है।",
      "गुण वही हैं जो आपने लिखे। वे अनंत नहीं।",
      "Recording.Location का अभाव मतलब रिकॉर्डिंग बंद थी या लेखन असफल।",
      "वास्तविक-समय चित्रों से एक दिन का औसत न निकालें।",
    ],
    mistake: "ऐसी गोदाम तालिका बनाना जो स्थानांतरण श्रृंखला का केवल अंतिम संपर्क रखे।",
  },
  te: {
    why: "CTR పూర్తయిన కాంటాక్ట్. రియల్-టైమ్ కొలతలు ఇప్పుడు యొక్క చిత్రం. అవి వేరు ప్రశ్నలకు సమాధానం.",
    paras: [
      "చూపగలిగే ఫీల్డ్‌లు: ContactId, Channel, InitiationMethod, చివరలు, క్యూ వ్యవధి, ఏజెంట్ సమయముద్రలు, ACW, డిస్‌కనెక్ట్ కారణం, లక్షణాలు, రికార్డింగ్ స్థానం. బదిలీలు మరో కాంటాక్ట్ సృష్టిస్తాయి. PreviousContactId మరియు NextContactId గొలుసు.",
      "Firehose లేదా స్ట్రీమ్‌కు డెలివరీ దాదాపు రియల్ టైమ్ మరియు నకిలీ కావచ్చు. వినియోగదారులు ఐడెంపోటెంట్ కావాలి. ఐదు నిమిషాల నిశ్శబ్దం లోపం ప్రిఫిక్స్ చూసే సమయం.",
    ],
    points: [
      "క్యారియర్ కాల్ కట్టేసిందని ఎవరైనా అంటే మొదటి ఫీల్డ్ DisconnectReason.",
      "లక్షణాలు మీరు రాసినవి. అవి అనంతం కావు.",
      "Recording.Location లేకపోవడం రికార్డింగ్ ఆఫ్ లేదా రాత విఫలం.",
      "రియల్-టైమ్ స్క్రీన్‌షాట్‌ల నుండి రోజును సగటు వేయకండి.",
    ],
    mistake: "బదిలీ గొలుసులో చివరి కాంటాక్ట్‌నే ఉంచే గిడ్డంగి పట్టిక కట్టడం.",
  },
  ar: {
    why: "CTR هو الجهة المنتهية. مقاييس الوقت الحقيقي صورة الآن. تجيب أسئلة مختلفة.",
    paras: [
      "حقول ينبغي أن تشير إليها: ContactId وChannel وInitiationMethod والأطراف ومدة الطابور وأختام الوكيل وACW وسبب القطع والسمات وموقع التسجيل. التحويلات تنشئ جهة أخرى. PreviousContactId وNextContactId هما السلسلة.",
      "التسليم إلى Firehose أو مجرى قريب من الوقت الحقيقي وقد يكرر. المستهلكون يجب أن يكونوا متماثلي المفعول. خمس دقائق من الصمت هي حين تفحص بادئة الخطأ.",
    ],
    points: [
      "DisconnectReason أول حقل حين يقول أحد إن الناقل قطع المكالمة.",
      "السمات هي ما كتبته. ليست بلا نهاية.",
      "غياب Recording.Location يعني التسجيل مطفأ أو الكتابة فشلت.",
      "لا تحسب متوسط يوم من لقطات الوقت الحقيقي.",
    ],
    mistake: "بناء جدول مستودع يُبقي آخر جهة فقط في سلسلة تحويل.",
  },
});

put("sec-kms", {
  es: {
    why: "Una clave administrada por el cliente que creaste y luego olvidaste compartir con Connect es una caída, no una victoria de seguridad.",
    paras: [
      "Las grabaciones y los informes exportados pueden usar una clave administrada por el cliente. La política de la clave debe permitir al rol de servicio de Connect generar claves de datos y descifrar. CloudTrail debería registrar el uso de la clave. La rotación está disponible y no vuelve a cifrar sola los objetos viejos.",
      "TLS cubre el CCP y las API en tránsito. Eso no cifra la grabación en reposo. Son controles separados.",
    ],
    points: [
      "Prueba una grabación de extremo a extremo después de cambiar la clave.",
      "Una región réplica necesita una estrategia de clave que de verdad hayas escrito.",
      "No uses la misma clave para grabaciones y para secretos de aplicación ajenos si te importa el radio de impacto.",
      "Hacen falta el acceso al bucket y el acceso a la clave para escuchar.",
    ],
    mistake: "Activar la clave en la consola y no llamar a un número de prueba.",
  },
  fr: {
    why: "Une clé gérée par le client créée puis oubliée pour Connect est une panne, pas une victoire de sécurité.",
    paras: [
      "Les enregistrements et les rapports exportés peuvent utiliser une clé gérée par le client. La politique de clé doit permettre au rôle de service Connect de générer des clés de données et de déchiffrer. CloudTrail devrait enregistrer l'usage de la clé. La rotation existe et ne rechiffre pas seule les anciens objets.",
      "TLS couvre le CCP et les API en transit. Cela ne chiffre pas l'enregistrement au repos. Ce sont des contrôles séparés.",
    ],
    points: [
      "Testez un enregistrement de bout en bout après un changement de clé.",
      "Une région réplica a besoin d'une stratégie de clé que vous avez vraiment écrite.",
      "N'utilisez pas la même clé pour les enregistrements et pour des secrets d'application sans rapport si le rayon compte.",
      "L'accès au bucket et l'accès à la clé sont tous deux requis pour écouter.",
    ],
    mistake: "Activer la clé dans la console et ne pas appeler un numéro de test.",
  },
  de: {
    why: "Ein kundenverwalteter Schlüssel, den Sie anlegten und Connect nicht gaben, ist ein Ausfall, kein Sicherheitsgewinn.",
    paras: [
      "Aufzeichnungen und exportierte Berichte können einen kundenverwalteten Schlüssel nutzen. Die Schlüsselrichtlinie muss der Connect-Servicerolle erlauben, Datenschlüssel zu erzeugen und zu entschlüsseln. CloudTrail sollte die Schlüsselnutzung aufzeichnen. Rotation ist verfügbar und verschlüsselt alte Objekte nicht von selbst neu.",
      "TLS deckt CCP und APIs unterwegs ab. Das verschlüsselt die Aufnahme im Ruhezustand nicht. Das sind getrennte Kontrollen.",
    ],
    points: [
      "Nach einem Schlüsselwechsel eine Aufnahme Ende zu Ende testen.",
      "Eine Replikatregion braucht eine Schlüsselstrategie, die wirklich aufgeschrieben ist.",
      "Nicht denselben Schlüssel für Aufnahmen und fremde Anwendungsgeheimnisse nutzen, wenn der Schadensradius zählt.",
      "Zugriff auf den Bucket und auf den Schlüssel sind beide nötig, um zu hören.",
    ],
    mistake: "Den Schlüssel in der Konsole einschalten und keine Testnummer anrufen.",
  },
  ja: {
    why: "作った顧客管理キーを Connect と共有し忘れるのは、セキュリティの勝ちではなく停止です。",
    paras: [
      "録音と書き出したレポートは顧客管理キーを使えます。キーポリシーは Connect のサービスロールにデータキーの生成と復号を許す必要があります。CloudTrail はキー使用を記録すべきです。ローテーションはできますが、古いオブジェクトを自分では再暗号化しません。",
      "TLS は転送中の CCP と API を覆います。保管中の録音は暗号化しません。別の制御です。",
    ],
    points: [
      "キーを変えたあと、録音を端から端まで試します。",
      "レプリカリージョンには、実際に書いたキー戦略が要ります。",
      "影響範囲が大事なら、録音と無関係なアプリの秘密に同じキーを使いません。",
      "聴くにはバケットへのアクセスとキーへのアクセスの両方が要ります。",
    ],
    mistake: "コンソールでキーを有効にして、試験番号に電話しないこと。",
  },
  hi: {
    why: "ग्राहक-प्रबंधित कुंजी बनाकर Connect से बाँटना भूलना सुरक्षा की जीत नहीं, व्यवधान है।",
    paras: [
      "रिकॉर्डिंग और निर्यात रिपोर्ट ग्राहक-प्रबंधित कुंजी उपयोग कर सकती हैं। कुंजी नीति को Connect सेवा भूमिका को डेटा कुंजी बनाने और डिक्रिप्ट करने देना चाहिए। CloudTrail कुंजी उपयोग दर्ज करे। घुमाव उपलब्ध है और पुरानी वस्तुओं को स्वयं पुनः एन्क्रिप्ट नहीं करता।",
      "TLS पारगमन में CCP और API ढकता है। वह विश्राम में रिकॉर्डिंग एन्क्रिप्ट नहीं करता। वे अलग नियंत्रण हैं।",
    ],
    points: [
      "कुंजी बदलने के बाद रिकॉर्डिंग अंत से अंत जाँचें।",
      "प्रतिकृति क्षेत्र को ऐसी कुंजी रणनीति चाहिए जो सच में लिखी हो।",
      "यदि प्रभाव त्रिज्या मायने रखे तो रिकॉर्डिंग और असंबंधित अनुप्रयोग रहस्यों के लिए वही कुंजी न लगाएँ।",
      "सुनने के लिए बकेट पहुँच और कुंजी पहुँच दोनों चाहिए।",
    ],
    mistake: "कंसोल में कुंजी चालू करके परीक्षण नंबर न बुलाना।",
  },
  te: {
    why: "మీరు సృష్టించి Connect తో పంచుకోవడం మర్చిన కస్టమర్-నిర్వహిత కీ భద్రత విజయం కాదు, అంతరాయం.",
    paras: [
      "రికార్డింగ్‌లు మరియు ఎగుమతి నివేదికలు కస్టమర్-నిర్వహిత కీ వాడవచ్చు. కీ పాలసీ Connect సేవా పాత్రకు డేటా కీలు సృష్టించి డీక్రిప్ట్ చేయనివ్వాలి. CloudTrail కీ వాడకం నమోదు చేయాలి. భ్రమణం అందుబాటులో ఉంది, పాత వస్తువులను తనంతట తాను మళ్లీ ఎన్‌క్రిప్ట్ చేయదు.",
      "TLS రవాణాలో CCP మరియు API లను కప్పుతుంది. నిల్వలో రికార్డింగ్‌ను ఎన్‌క్రిప్ట్ చేయదు. అవి వేరు నియంత్రణలు.",
    ],
    points: [
      "కీ మార్చిన తర్వాత రికార్డింగ్‌ను చివరి నుండి చివరి పరీక్షించండి.",
      "రెప్లికా రీజియన్‌కు మీరు నిజంగా రాసిన కీ వ్యూహం కావాలి.",
      "ప్రభావ వ్యాసార్థం ముఖ్యమైతే రికార్డింగ్‌లు మరియు సంబంధం లేని అప్లికేషన్ రహస్యాలకు అదే కీ వాడకండి.",
      "వినడానికి బకెట్ ప్రవేశం మరియు కీ ప్రవేశం రెండూ కావాలి.",
    ],
    mistake: "కన్సోల్‌లో కీని ఆన్ చేసి పరీక్ష నంబర్‌కు కాల్ చేయకపోవడం.",
  },
  ar: {
    why: "مفتاح يديره العميل أنشأته ثم نسيت مشاركته مع Connect انقطاع، لا انتصار أمني.",
    paras: [
      "التسجيلات والتقارير المصدّرة يمكن أن تستخدم مفتاحًا يديره العميل. سياسة المفتاح يجب أن تسمح لدور خدمة Connect بتوليد مفاتيح بيانات وفك التشفير. ينبغي أن يسجّل CloudTrail استخدام المفتاح. التدوير متاح ولا يعيد تشفير الكائنات القديمة وحده.",
      "TLS يغطي CCP والواجهات أثناء النقل. ذلك لا يشفر التسجيل في السكون. تحكمان منفصلان.",
    ],
    points: [
      "اختبر تسجيلًا من الطرف إلى الطرف بعد تغيير المفتاح.",
      "منطقة النسخة تحتاج استراتيجية مفتاح كتبتها فعلًا.",
      "لا تستخدم المفتاح نفسه للتسجيلات ولأسرار تطبيق غير ذات صلة إذا كان نصف قطر الأثر يهم.",
      "الوصول إلى الدلو والوصول إلى المفتاح كلاهما مطلوب للاستماع.",
    ],
    mistake: "تفعيل المفتاح في وحدة التحكم وعدم الاتصال برقم اختبار.",
  },
});

put("res-pair", {
  es: {
    why: "AWS dice que Global Resiliency es el enfoque multirregión admitido, y que los diseños no admitidos pueden afectar las cuotas y el relato del SLA.",
    paras: [
      "Replicas una instancia enlazada, pones números en un grupo de distribución de tráfico y desplazas telefonía y agentes en pasos del 10 por ciento. Los pares son Virginia del Norte y Oregón, Fráncfort y Londres, Tokio y Osaka. Las instancias nuevas desde el 1 de septiembre de 2026 reciben enrutamiento global, analítica y búsqueda de contactos por defecto. Las antiguas se pueden migrar bajo petición.",
      "ReplicateInstance copia flujos, módulos, usuarios, perfiles, colas, horarios, conexiones rápidas y asociaciones de números. No copia los avisos que viven solo como objetos sueltos de S3 del modo que la gente supone. Lee la página de la réplica antes de la prueba.",
    ],
    points: [
      "La identidad tiene que funcionar en ambas regiones.",
      "Una Lambda del flujo debe existir en ambas regiones.",
      "La entrega por Osaka puede tardar hasta 20 segundos.",
      "Desplaza primero el 10 por ciento. No empieces en 100.",
    ],
    mistake: "Una segunda instancia sin relación y un truco de DNS.",
  },
  fr: {
    why: "AWS dit que Global Resiliency est l'approche multirégion prise en charge, et que les conceptions non prises en charge peuvent affecter les quotas et le récit du SLA.",
    paras: [
      "Vous répliquez une instance liée, placez les numéros dans un groupe de distribution de trafic et déplacez téléphonie et agents par pas de 10 pour cent. Les paires sont Virginie du Nord et Oregon, Francfort et Londres, Tokyo et Osaka. Les instances nouvelles depuis le 1er septembre 2026 reçoivent par défaut routage global, analytique et recherche de contacts. Les anciennes peuvent être migrées sur demande.",
      "ReplicateInstance copie flux, modules, utilisateurs, profils, files, horaires, connexions rapides et associations de numéros. Il ne copie pas les invites qui ne vivent que comme objets S3 lâches comme on le suppose. Lisez la page de réplica avant le test.",
    ],
    points: [
      "L'identité doit fonctionner dans les deux régions.",
      "Une Lambda du flux doit exister dans les deux régions.",
      "La livraison par Osaka peut prendre jusqu'à 20 secondes.",
      "Déplacez d'abord 10 pour cent. Ne commencez pas à 100.",
    ],
    mistake: "Une seconde instance sans lien et une astuce DNS.",
  },
  de: {
    why: "AWS sagt, Global Resiliency sei der unterstützte Mehrregionenansatz, und nicht unterstützte Entwürfe können Kontingente und die SLA-Geschichte berühren.",
    paras: [
      "Sie replizieren eine verknüpfte Instanz, legen Nummern in eine Traffic-Distribution-Gruppe und verschieben Telefonie und Agenten in 10-Prozent-Schritten. Paare sind Nord-Virginia und Oregon, Frankfurt und London, Tokio und Osaka. Neue Instanzen ab 1. September 2026 bekommen globales Routing, Analytik und Kontaktsuche standardmäßig. Ältere lassen sich auf Anfrage migrieren.",
      "ReplicateInstance kopiert Flows, Module, Benutzer, Profile, Queues, Stunden, Quick Connects und Nummernzuordnungen. Es kopiert Ansagen, die nur als lose S3-Objekte liegen, nicht so, wie Leute annehmen. Die Replikatseite vor dem Test lesen.",
    ],
    points: [
      "Identität muss in beiden Regionen funktionieren.",
      "Ein Lambda im Flow muss in beiden Regionen existieren.",
      "Lieferung über Osaka kann bis zu 20 Sekunden dauern.",
      "Zuerst 10 Prozent verschieben. Nicht bei 100 beginnen.",
    ],
    mistake: "Eine zweite unverknüpfte Instanz und ein DNS-Trick.",
  },
  ja: {
    why: "AWS は Global Resiliency がサポートされるマルチリージョンのやり方だと言い、サポート外の設計はクォータと SLA の話に影響し得ると言います。",
    paras: [
      "リンクしたインスタンスを複製し、番号をトラフィック分散グループに入れ、電話とエージェントを 10 パーセント刻みで移します。組は北バージニアとオレゴン、フランクフルトとロンドン、東京と大阪です。2026年9月1日以降の新しいインスタンスは、グローバルルーティング、分析、コンタクト検索を既定で受けます。古いものは依頼で移行できます。",
      "ReplicateInstance はフロー、モジュール、ユーザー、プロファイル、キュー、営業時間、クイックコネクト、番号の関連をコピーします。人が思うような、ばらの S3 オブジェクトだけのプロンプトはコピーしません。試験の前にレプリカのページを読みます。",
    ],
    points: [
      "ID は両方のリージョンで動く必要があります。",
      "フローの Lambda は両方のリージョンに存在する必要があります。",
      "大阪経由の配送は最大 20 秒かかり得ます。",
      "最初は 10 パーセント移します。100 から始めません。",
    ],
    mistake: "関係のない二つ目のインスタンスと DNS の仕掛け。",
  },
  hi: {
    why: "AWS कहता है Global Resiliency समर्थित बहु-क्षेत्र तरीका है, और असमर्थित डिज़ाइन कोटा और SLA की कथा को प्रभावित कर सकते हैं।",
    paras: [
      "आप लिंक किया इंस्टेंस प्रतिकृति करते हैं, नंबर ट्रैफ़िक वितरण समूह में रखते हैं, और टेलीफ़ोनी व एजेंट 10 प्रतिशत चरणों में खिसकाते हैं। जोड़े उत्तरी वर्जीनिया और ओरेगन, फ़्रैंकफ़र्ट और लंदन, टोक्यो और ओसाका हैं। 1 सितंबर 2026 से नए इंस्टेंस को डिफ़ॉल्ट वैश्विक रूटिंग, विश्लेषण और संपर्क खोज मिलती है। पुराने अनुरोध पर स्थानांतरित हो सकते हैं।",
      "ReplicateInstance फ़्लो, मॉड्यूल, उपयोगकर्ता, प्रोफ़ाइल, कतार, घंटे, त्वरित कनेक्ट और नंबर संबंध कॉपी करता है। वह संकेत नहीं कॉपी करता जो लोग मानते हैं केवल ढीली S3 वस्तुओं के रूप में रहते हैं। जाँच से पहले प्रतिकृति पृष्ठ पढ़ें।",
    ],
    points: [
      "पहचान दोनों क्षेत्रों में काम करनी चाहिए।",
      "फ़्लो का Lambda दोनों क्षेत्रों में होना चाहिए।",
      "ओसाका डिलीवरी 20 सेकंड तक ले सकती है।",
      "पहले 10 प्रतिशत खिसकाएँ। 100 से शुरू न करें।",
    ],
    mistake: "दूसरा असंबंधित इंस्टेंस और DNS की चाल।",
  },
  te: {
    why: "AWS చెబుతుంది Global Resiliency మద్దతు ఉన్న బహుళ-రీజియన్ విధానం, మద్దతు లేని డిజైన్‌లు కోటాలు మరియు SLA కథను ప్రభావితం చేయవచ్చు.",
    paras: [
      "లింక్ చేసిన ఇన్‌స్టాన్స్‌ను ప్రతిరూపం చేసి, నంబర్లను ట్రాఫిక్ పంపిణీ గుంపులో పెట్టి, టెలిఫోనీ మరియు ఏజెంట్లను 10 శాతం అడుగుల్లో జరుపుతారు. జంటలు ఉత్తర వర్జీనియా మరియు ఒరెగాన్, ఫ్రాంక్‌ఫర్ట్ మరియు లండన్, టోక్యో మరియు ఒసాకా. 1 సెప్టెంబర్ 2026 నుండి కొత్త ఇన్‌స్టాన్స్‌లకు గ్లోబల్ రూటింగ్, విశ్లేషణ, కాంటాక్ట్ శోధన డిఫాల్ట్. పాతవి అభ్యర్థనపై మారవచ్చు.",
      "ReplicateInstance ఫ్లోలు, మాడ్యూల్‌లు, వినియోగదారులు, ప్రొఫైల్‌లు, క్యూలు, గంటలు, క్విక్ కనెక్ట్‌లు, నంబర్ అనుబంధాలు కాపీ చేస్తుంది. ప్రజలు అనుకున్నట్లు వదులు S3 వస్తువులుగా మాత్రమే ఉన్న ప్రాంప్ట్‌లను కాపీ చేయదు. పరీక్ష ముందు రెప్లికా పేజీ చదవండి.",
    ],
    points: [
      "గుర్తింపు రెండు రీజియన్‌లలో పనిచేయాలి.",
      "ఫ్లోలో Lambda రెండు రీజియన్‌లలో ఉండాలి.",
      "ఒసాకా డెలివరీ 20 సెకన్ల వరకు పట్టవచ్చు.",
      "ముందు 10 శాతం జరపండి. 100 వద్ద మొదలుపెట్టకండి.",
    ],
    mistake: "సంబంధం లేని రెండవ ఇన్‌స్టాన్స్ మరియు DNS ట్రిక్.",
  },
  ar: {
    why: "تقول AWS إن Global Resiliency هو نهج المناطق المتعددة المدعوم، وإن التصاميم غير المدعومة قد تؤثر في الحصص وقصة SLA.",
    paras: [
      "تنسخ مثيلًا مرتبطًا، وتضع الأرقام في مجموعة توزيع حركة، وتنقل الهاتف والوكلاء بخطوات 10 بالمئة. الأزواج شمال فرجينيا وأوريغون، وفرانكفورت ولندن، وطوكيو وأوساكا. المثيلات الجديدة من 1 سبتمبر 2026 تحصل افتراضيًا على توجيه عالمي وتحليلات وبحث جهات. القديمة يمكن ترحيلها عند الطلب.",
      "ReplicateInstance ينسخ التدفقات والوحدات والمستخدمين والملفات والطوابير والساعات والاتصالات السريعة وارتباطات الأرقام. لا ينسخ المطالبات التي تعيش فقط ككائنات S3 سائبة كما يظن الناس. اقرأ صفحة النسخة قبل الاختبار.",
    ],
    points: [
      "الهوية يجب أن تعمل في المنطقتين.",
      "Lambda في التدفق يجب أن يوجد في المنطقتين.",
      "التسليم عبر أوساكا قد يأخذ حتى 20 ثانية.",
      "انقل 10 بالمئة أولًا. لا تبدأ عند 100.",
    ],
    mistake: "مثيل ثانٍ غير مرتبط وخدعة DNS.",
  },
});

put("ts-method", {
  es: {
    why: "Las mismas cuatro preguntas sirven en un troncal CUCM y en un flujo de Connect.",
    paras: [
      "¿Qué salto falló: operador, flujo, Lambda, cola o softphone? ¿Qué ContactId une los registros? ¿Qué contador se movió: profundidad de cola, llamadas concurrentes, errores de Lambda o fallos UDP? ¿Qué captura lo prueba: registro del flujo, CTR, prueba de extremo o una grabación?",
      "Cambia una cosa. Vuelve a probar el escenario de ese ContactId. Luego para.",
    ],
    points: [
      "Un error de registro de flujo sin registro de Lambda es un permiso o un rechazo de carga.",
      "Un error del CCP que nombra TurnNlb es la red, aunque el flujo sea perfecto.",
      "Un tono de ocupado rápido en una campaña es la cuota cero hasta que se demuestre lo contrario.",
      "Una grabación ausente es el bloque, el bucket o la clave.",
    ],
    mistake: "Cambiar el flujo, la Lambda y el firewall en una tarde.",
  },
  fr: {
    why: "Les mêmes quatre questions marchent sur un trunk CUCM et sur un flux Connect.",
    paras: [
      "Quel saut a échoué : opérateur, flux, Lambda, file ou softphone ? Quel ContactId joint les journaux ? Quel compteur a bougé : profondeur de file, appels simultanés, erreurs Lambda ou échecs UDP ? Quelle capture le prouve : journal de flux, CTR, test de point de terminaison ou un enregistrement ?",
      "Changez une chose. Retestez le scénario de ce ContactId. Puis arrêtez.",
    ],
    points: [
      "Une erreur de journal de flux sans journal Lambda est une permission ou un rejet de charge.",
      "Une erreur CCP qui nomme TurnNlb est le réseau, même si le flux est parfait.",
      "Un occupé rapide sur une campagne est le quota zéro jusqu'à preuve du contraire.",
      "Un enregistrement absent est le bloc, le bucket ou la clé.",
    ],
    mistake: "Changer le flux, la Lambda et le pare-feu dans un après-midi.",
  },
  de: {
    why: "Dieselben vier Fragen gelten an einem CUCM-Trunk und an einem Connect-Flow.",
    paras: [
      "Welcher Hop fiel aus: Carrier, Flow, Lambda, Queue oder Softphone? Welche ContactId verbindet die Protokolle? Welcher Zähler bewegte sich: Queuetiefe, gleichzeitige Anrufe, Lambda-Fehler oder UDP-Fehler? Welche Aufnahme beweist es: Flow-Protokoll, CTR, Endpunkttest oder eine Aufzeichnung?",
      "Eine Sache ändern. Das Szenario dieser ContactId erneut testen. Dann aufhören.",
    ],
    points: [
      "Ein Flow-Protokollfehler ohne Lambda-Protokoll ist eine Berechtigung oder eine abgelehnte Nutzlast.",
      "Ein CCP-Fehler, der TurnNlb nennt, ist das Netz, auch wenn der Flow perfekt ist.",
      "Ein schnelles Besetzt bei einer Kampagne ist das Null-Kontingent, bis das Gegenteil bewiesen ist.",
      "Eine fehlende Aufnahme ist der Block, der Bucket oder der Schlüssel.",
    ],
    mistake: "Flow, Lambda und Firewall an einem Nachmittag ändern.",
  },
  ja: {
    why: "同じ四つの問いは CUCM トランクでも Connect フローでも使えます。",
    paras: [
      "どのホップが失敗したか: キャリア、フロー、Lambda、キュー、ソフトフォン。どの ContactId がログを結ぶか。どのカウンタが動いたか: キューの深さ、同時通話、Lambda エラー、UDP 失敗。何が証明するか: フローログ、CTR、エンドポイント試験、録音。",
      "一つ変えます。その ContactId のシナリオを再試験します。それから止めます。",
    ],
    points: [
      "フローログのエラーがあって Lambda ログが無いのは、権限かペイロード拒否です。",
      "TurnNlb を名指す CCP エラーはネットワークです。フローが完全でもです。",
      "キャンペーンの速い話中音は、反証までゼロクォータです。",
      "録音が無いのはブロックかバケットかキーです。",
    ],
    mistake: "午後のうちにフローと Lambda とファイアウォールを全部変えること。",
  },
  hi: {
    why: "वही चार प्रश्न CUCM ट्रंक और Connect फ़्लो दोनों पर काम करते हैं।",
    paras: [
      "कौन-सी छलांग विफल: कैरियर, फ़्लो, Lambda, कतार या सॉफ़्टफ़ोन? कौन-सा ContactId लॉग जोड़ता है? कौन-सा काउंटर हिला: कतार गहराई, समवर्ती कॉल, Lambda त्रुटियाँ या UDP विफलता? कौन-सा कैप्चर सिद्ध करता है: फ़्लो लॉग, CTR, एंडपॉइंट जाँच या रिकॉर्डिंग?",
      "एक चीज़ बदलें। उस ContactId का परिदृश्य फिर जाँचें। फिर रुकें।",
    ],
    points: [
      "Lambda लॉग के बिना फ़्लो लॉग त्रुटि अनुमति या भार अस्वीकृति है।",
      "TurnNlb का नाम लेने वाली CCP त्रुटि नेटवर्क है, चाहे फ़्लो पूर्ण हो।",
      "अभियान पर तेज़ व्यस्त स्वर शून्य कोटा है जब तक उलटा सिद्ध न हो।",
      "गायब रिकॉर्डिंग ब्लॉक, बकेट या कुंजी है।",
    ],
    mistake: "एक दोपहर में फ़्लो, Lambda और फ़ायरवॉल बदलना।",
  },
  te: {
    why: "అదే నాలుగు ప్రశ్నలు CUCM ట్రంక్‌పై మరియు Connect ఫ్లోపై పనిచేస్తాయి.",
    paras: [
      "ఏ హాప్ విఫలమైంది: క్యారియర్, ఫ్లో, Lambda, క్యూ లేదా సాఫ్ట్‌ఫోన్? ఏ ContactId లాగ్‌లను కలుపుతుంది? ఏ కౌంటర్ కదిలింది: క్యూ లోతు, ఏకకాల కాల్‌లు, Lambda లోపాలు లేదా UDP వైఫల్యాలు? ఏ క్యాప్చర్ నిరూపిస్తుంది: ఫ్లో లాగ్, CTR, ఎండ్‌పాయింట్ పరీక్ష లేదా రికార్డింగ్?",
      "ఒకటి మార్చండి. ఆ ContactId దృశ్యాన్ని మళ్లీ పరీక్షించండి. తర్వాత ఆపండి.",
    ],
    points: [
      "Lambda లాగ్ లేకుండా ఫ్లో లాగ్ లోపం అనుమతి లేదా పేలోడ్ తిరస్కరణ.",
      "TurnNlb పేరు చెప్పే CCP లోపం నెట్‌వర్క్, ఫ్లో పరిపూర్ణమైనా.",
      "ప్రచారంపై వేగవంతమైన బిజీ సున్నా కోటా, వ్యతిరేకం నిరూపించే వరకు.",
      "లేని రికార్డింగ్ బ్లాక్, బకెట్ లేదా కీ.",
    ],
    mistake: "ఒక మధ్యాహ్నంలో ఫ్లో, Lambda, ఫైర్‌వాల్ మార్చడం.",
  },
  ar: {
    why: "الأسئلة الأربعة نفسها تعمل على جذع CUCM وعلى تدفق Connect.",
    paras: [
      "أي قفزة فشلت: الناقل أم التدفق أم Lambda أم الطابور أم الهاتف البرمجي؟ أي ContactId يربط السجلات؟ أي عداد تحرك: عمق الطابور أم المكالمات المتزامنة أم أخطاء Lambda أم فشل UDP؟ أي التقاط يثبت: سجل التدفق أم CTR أم اختبار نقطة النهاية أم تسجيل؟",
      "غيّر شيئًا واحدًا. أعد اختبار سيناريو ContactId ذاك. ثم توقف.",
    ],
    points: [
      "خطأ سجل تدفق بلا سجل Lambda إذن أو رفض حمولة.",
      "خطأ CCP يسمّي TurnNlb هو الشبكة، حتى لو كان التدفق كاملًا.",
      "مشغول سريع في حملة هو الحصة الصفر حتى يثبت العكس.",
      "تسجيل غائب هو الكتلة أو الدلو أو المفتاح.",
    ],
    mistake: "تغيير التدفق وLambda وجدار الحماية في عصر واحد.",
  },
});

put("br-map", {
  es: {
    why: "Los nombres de la plataforma vieja no son recursos de Connect. Escribe el mapa antes de construir las colas.",
    paras: [
      "Un calling search space de CUCM no es un perfil de enrutamiento, pero el perfil es la idea más cercana de quién puede recibir qué. Una partición no es un objeto de Connect. Una CSQ de UCCX y un skill group de UCCE se mapean a una cola. Los pasos de precisión se mapean a criterios de enrutamiento. Un script, un flujo de Architect y un vector de Avaya se mapean a un flujo de contacto.",
      "Finesse se mapea al CCP o a un escritorio de Streams. CUIC se mapea a métricas en tiempo real, métricas históricas y el CTR. Un troncal de grabación se mapea al bloque de grabación y a S3.",
    ],
    points: [
      "Escribe una fila por objeto viejo, con el objeto de Connect y la trampa.",
      "Las skills pueden volverse competencias o colas extra. Elige una y di por qué.",
      "Los hunt pilots se vuelven colas más prioridad y retardo.",
      "El traductor del laboratorio hace esto fila por fila.",
    ],
    mistake: "Crear una cola con el nombre de cada partición de CUCM.",
  },
  fr: {
    why: "Les noms de l'ancienne plateforme ne sont pas des ressources Connect. Écrivez la carte avant de construire les files.",
    paras: [
      "Un calling search space CUCM n'est pas un profil de routage, mais le profil est l'idée la plus proche de qui peut recevoir quoi. Une partition n'est pas un objet Connect. Une CSQ UCCX et un skill group UCCE se mappent à une file. Les étapes de précision se mappent à des critères de routage. Un script, un flux Architect et un vecteur Avaya se mappent à un flux de contact.",
      "Finesse se mappe au CCP ou à un bureau Streams. CUIC se mappe aux métriques temps réel, historiques et au CTR. Un trunk d'enregistrement se mappe au bloc d'enregistrement et à S3.",
    ],
    points: [
      "Écrivez une ligne par ancien objet, avec l'objet Connect et le piège.",
      "Les skills peuvent devenir des compétences ou des files en plus. Choisissez et dites pourquoi.",
      "Les hunt pilots deviennent des files plus priorité et délai.",
      "Le traducteur du labo le fait ligne par ligne.",
    ],
    mistake: "Créer une file nommée d'après chaque partition CUCM.",
  },
  de: {
    why: "Namen der alten Plattform sind keine Connect-Ressourcen. Die Karte schreiben, bevor die Queues gebaut werden.",
    paras: [
      "Ein CUCM Calling Search Space ist kein Routing-Profil, aber das Profil ist die nächste Idee von wer was empfangen kann. Eine Partition ist kein Connect-Objekt. Eine UCCX-CSQ und eine UCCE-Skill-Group werden zu einer Queue. Precision-Schritte werden zu Routing-Kriterien. Ein Skript, ein Architect-Flow und ein Avaya-Vektor werden zu einem Kontakt-Flow.",
      "Finesse wird zum CCP oder einem Streams-Desktop. CUIC wird zu Echtzeitmetriken, historischen Metriken und dem CTR. Ein Recording-Trunk wird zum Aufnahmeblock und zu S3.",
    ],
    points: [
      "Eine Zeile je altem Objekt, mit dem Connect-Objekt und der Falle.",
      "Skills können Fertigkeiten oder extra Queues werden. Eins wählen und sagen warum.",
      "Hunt Pilots werden Queues plus Priorität und Verzögerung.",
      "Der Labor-Übersetzer tut das Zeile für Zeile.",
    ],
    mistake: "Eine Queue nach jeder CUCM-Partition benennen.",
  },
  ja: {
    why: "旧基盤の名前は Connect の資源ではありません。キューを作る前に対応表を書きます。",
    paras: [
      "CUCM の calling search space はルーティングプロファイルではありませんが、誰が何を受けられるかに最も近い考えはプロファイルです。パーティションは Connect のオブジェクトではありません。UCCX の CSQ と UCCE のスキルグループはキューに対応します。プレシジョンの段はルーティング基準に対応します。スクリプト、Architect フロー、Avaya ベクタはコンタクトフローに対応します。",
      "Finesse は CCP か Streams のデスクトップに対応します。CUIC はリアルタイム指標、履歴指標、CTR に対応します。録音トランクは録音ブロックと S3 に対応します。",
    ],
    points: [
      "古いオブジェクトごとに一行、Connect のオブジェクトと落とし穴を書きます。",
      "スキルは熟練度か追加キューになります。一つ選び、理由を言います。",
      "ハントパイロットはキューに優先度と遅延を足したものになります。",
      "このラボの翻訳器はそれを一行ずつやります。",
    ],
    mistake: "CUCM のパーティションごとに名前を付けたキューを作ること。",
  },
  hi: {
    why: "पुराने प्लेटफ़ॉर्म के नाम Connect संसाधन नहीं हैं। कतारें बनाने से पहले नक्शा लिखें।",
    paras: [
      "CUCM calling search space रूटिंग प्रोफ़ाइल नहीं है, पर कौन क्या प्राप्त कर सकता है का निकटतम विचार प्रोफ़ाइल है। पार्टिशन Connect वस्तु नहीं। UCCX CSQ और UCCE skill group कतार से मेल खाते हैं। प्रेसिजन चरण रूटिंग मापदंड से मेल खाते हैं। स्क्रिप्ट, Architect फ़्लो और Avaya वेक्टर संपर्क फ़्लो से मेल खाते हैं।",
      "Finesse CCP या Streams डेस्कटॉप से मेल खाता है। CUIC वास्तविक-समय माप, ऐतिहासिक माप और CTR से मेल खाता है। रिकॉर्डिंग ट्रंक रिकॉर्डिंग ब्लॉक और S3 से मेल खाता है।",
    ],
    points: [
      "हर पुरानी वस्तु की एक पंक्ति लिखें, Connect वस्तु और जाल के साथ।",
      "कौशल प्रवीणता या अतिरिक्त कतार बन सकते हैं। एक चुनें और कारण कहें।",
      "हंट पायलट कतार तथा प्राथमिकता और विलंब बनते हैं।",
      "प्रयोगशाला अनुवादक यह पंक्ति-दर-पंक्ति करता है।",
    ],
    mistake: "हर CUCM पार्टिशन के नाम पर कतार बनाना।",
  },
  te: {
    why: "పాత ప్లాట్‌ఫామ్ పేర్లు Connect వనరులు కావు. క్యూలు కట్టే ముందు మ్యాప్ రాయండి.",
    paras: [
      "CUCM calling search space రూటింగ్ ప్రొఫైల్ కాదు, కానీ ఎవరు ఏమి స్వీకరించగలరో దగ్గరి ఆలోచన ప్రొఫైల్. పార్టిషన్ Connect వస్తువు కాదు. UCCX CSQ మరియు UCCE skill group క్యూకు మ్యాప్ అవుతాయి. ప్రెసిషన్ అడుగులు రూటింగ్ ప్రమాణాలకు మ్యాప్ అవుతాయి. స్క్రిప్ట్, Architect ఫ్లో, Avaya వెక్టర్ కాంటాక్ట్ ఫ్లోకు మ్యాప్ అవుతాయి.",
      "Finesse CCP లేదా Streams డెస్క్‌టాప్‌కు మ్యాప్ అవుతుంది. CUIC రియల్-టైమ్ కొలతలు, చారిత్రక కొలతలు, CTR కు మ్యాప్ అవుతుంది. రికార్డింగ్ ట్రంక్ రికార్డింగ్ బ్లాక్ మరియు S3 కు మ్యాప్ అవుతుంది.",
    ],
    points: [
      "పాత వస్తువుకు ఒక వరుస రాయండి, Connect వస్తువు మరియు ఉచ్చుతో.",
      "నైపుణ్యాలు ప్రావీణ్యాలు లేదా అదనపు క్యూలు కావచ్చు. ఒకటి ఎంచి ఎందుకో చెప్పండి.",
      "హంట్ పైలట్‌లు క్యూలు ప్లస్ ప్రాధాన్యత మరియు ఆలస్యం అవుతాయి.",
      "ల్యాబ్ అనువాదకుడు దీన్ని వరుస వరుసగా చేస్తాడు.",
    ],
    mistake: "ప్రతి CUCM పార్టిషన్ పేరుతో క్యూ సృష్టించడం.",
  },
  ar: {
    why: "أسماء المنصة القديمة ليست موارد Connect. اكتب الخريطة قبل بناء الطوابير.",
    paras: [
      "calling search space في CUCM ليس ملف توجيه، لكن الملف أقرب فكرة لمن يستطيع استقبال ماذا. القسم ليس كائن Connect. CSQ في UCCX ومجموعة مهارة UCCE يقابلان طابورًا. خطوات الدقة تقابل معايير التوجيه. سكربت وتدفق Architect ومتجه Avaya تقابل تدفق جهة.",
      "Finesse يقابل CCP أو سطح Streams. CUIC يقابل مقاييس الوقت الحقيقي والتاريخية وCTR. جذع التسجيل يقابل كتلة التسجيل وS3.",
    ],
    points: [
      "اكتب صفًا لكل كائن قديم، مع كائن Connect والفخ.",
      "المهارات قد تصير كفاءات أو طوابير إضافية. اختر وقل لماذا.",
      "Hunt pilots تصير طوابير زائد أولوية وتأخير.",
      "مترجم المختبر يفعل ذلك صفًا صفًا.",
    ],
    mistake: "إنشاء طابور باسم كل قسم CUCM.",
  },
});

put("int-sf", {
  es: {
    why: "La voz se queda en Connect. La pregunta es qué sistema posee los canales digitales y el caso.",
    paras: [
      "El CTI Adapter es un paquete gestionado más una aplicación sin servidor que incrusta el CCP en Salesforce. Instálalo primero en un sandbox. Salesforce Contact Center with Amazon Connect va más lejos: la telefonía y la voz dentro de la app siguen nativas de Connect, y la mensajería puede ser de cualquiera de las dos plataformas. La organización necesita Service Cloud Voice, y las funciones digitales necesitan Digital Engagement.",
      "La pantalla emergente usa los atributos que guardaste y el ANI o el id del cliente. Si transfieres a un número de teléfono, Salesforce del otro lado no verá esos atributos.",
    ],
    points: [
      "Un sistema de registro para el caso.",
      "La aplicación sin servidor tiene un rol IAM. Revísalo.",
      "Sandbox, luego producción.",
      "Prueba el clic para marcar saliente. Usa las reglas de identificador de llamada.",
    ],
    mistake: "Incrustar el CCP y además ejecutar un segundo softphone.",
  },
  fr: {
    why: "La voix reste sur Connect. La question est quel système possède les canaux numériques et le dossier.",
    paras: [
      "Le CTI Adapter est un package géré plus une application sans serveur qui intègre le CCP dans Salesforce. Installez-le d'abord dans un sandbox. Salesforce Contact Center with Amazon Connect va plus loin : la téléphonie et la voix in-app restent natives de Connect, et la messagerie peut être celle de l'une ou l'autre plateforme. L'org a besoin de Service Cloud Voice, et les fonctions numériques de Digital Engagement.",
      "L'écran contextuel utilise les attributs que vous avez stockés et l'ANI ou l'identifiant client. Si vous transférez vers un numéro, Salesforce de l'autre côté ne verra pas ces attributs.",
    ],
    points: [
      "Un système d'enregistrement pour le dossier.",
      "L'application sans serveur a un rôle IAM. Relisez-le.",
      "Sandbox, puis production.",
      "Testez le clic pour appeler en sortie. Il utilise les règles d'identifiant d'appel.",
    ],
    mistake: "Intégrer le CCP et faire tourner en plus un second softphone.",
  },
  de: {
    why: "Sprache bleibt auf Connect. Die Frage ist, welches System die digitalen Kanäle und den Fall besitzt.",
    paras: [
      "Der CTI Adapter ist ein verwaltetes Paket plus eine serverlose Anwendung, die den CCP in Salesforce einbettet. Zuerst in einer Sandbox installieren. Salesforce Contact Center with Amazon Connect geht weiter: Telefonie und In-App-Sprache bleiben nativ bei Connect, Messaging kann von beiden Plattformen sein. Die Org braucht Service Cloud Voice, digitale Funktionen brauchen Digital Engagement.",
      "Screen Pop nutzt die gespeicherten Attribute und die ANI oder die Kunden-ID. Bei einem Transfer an eine Telefonnummer sieht Salesforce auf der anderen Seite diese Attribute nicht.",
    ],
    points: [
      "Ein System of Record für den Fall.",
      "Die serverlose App hat eine IAM-Rolle. Prüfen.",
      "Sandbox, dann Produktion.",
      "Ausgehendes Click-to-dial testen. Es nutzt die Anrufer-ID-Regeln.",
    ],
    mistake: "Den CCP einbetten und zusätzlich ein zweites Softphone laufen lassen.",
  },
  ja: {
    why: "音声は Connect に残ります。問いは、デジタルチャネルとケースをどのシステムが持つかです。",
    paras: [
      "CTI Adapter は管理パッケージと、CCP を Salesforce に埋め込むサーバーレスアプリです。まずサンドボックスに入れます。Salesforce Contact Center with Amazon Connect はさらに進みます。電話とアプリ内音声は Connect ネイティブのままで、メッセージはどちらの基盤でもあり得ます。組織には Service Cloud Voice が要り、デジタル機能には Digital Engagement が要ります。",
      "画面ポップは保存した属性と ANI か顧客 ID を使います。電話番号へ転送すると、向こう側の Salesforce はその属性を見ません。",
    ],
    points: [
      "ケースの記録システムは一つ。",
      "サーバーレスアプリには IAM ロールがあります。見直します。",
      "サンドボックス、それから本番。",
      "発信のクリック通話を試します。発信者番号の規則を使います。",
    ],
    mistake: "CCP を埋め込んだうえに、二つ目のソフトフォンも動かすこと。",
  },
  hi: {
    why: "आवाज़ Connect पर रहती है। प्रश्न है डिजिटल चैनल और केस किस प्रणाली के हैं।",
    paras: [
      "CTI Adapter एक प्रबंधित पैकेज और एक सर्वर-रहित अनुप्रयोग है जो CCP को Salesforce में जड़ता है। पहले सैंडबॉक्स में लगाएँ। Salesforce Contact Center with Amazon Connect आगे जाता है: टेलीफ़ोनी और इन-ऐप आवाज़ Connect की मूल रहती हैं, और संदेश किसी भी प्लेटफ़ॉर्म के हो सकते हैं। संगठन को Service Cloud Voice चाहिए, डिजिटल सुविधाओं को Digital Engagement।",
      "स्क्रीन पॉप आपके सहेजे गुण और ANI या ग्राहक पहचान उपयोग करता है। फ़ोन नंबर पर स्थानांतरण करें तो दूसरी ओर का Salesforce वे गुण नहीं देखेगा।",
    ],
    points: [
      "केस के लिए एक अभिलेख प्रणाली।",
      "सर्वर-रहित ऐप की IAM भूमिका है। उसकी समीक्षा करें।",
      "सैंडबॉक्स, फिर उत्पादन।",
      "जावक क्लिक-टू-डायल जाँचें। वह कॉलर पहचान नियम उपयोग करता है।",
    ],
    mistake: "CCP जड़ना और साथ दूसरा सॉफ़्टफ़ोन चलाना।",
  },
  te: {
    why: "వాయిస్ Connect పైనే ఉంటుంది. ప్రశ్న డిజిటల్ ఛానళ్లు మరియు కేసు ఏ వ్యవస్థ సొంతం.",
    paras: [
      "CTI Adapter నిర్వహిత ప్యాకేజీ మరియు CCP ను Salesforce లో పొదిగే సర్వర్‌లేని అప్లికేషన్. ముందు శాండ్‌బాక్స్‌లో పెట్టండి. Salesforce Contact Center with Amazon Connect మరింత ముందుకు వెళ్తుంది: టెలిఫోనీ మరియు యాప్‌లో వాయిస్ Connect స్వంతంగా ఉంటాయి, సందేశాలు ఏ ప్లాట్‌ఫామ్‌వైనా కావచ్చు. సంస్థకు Service Cloud Voice కావాలి, డిజిటల్ సౌలభ్యాలకు Digital Engagement.",
      "స్క్రీన్ పాప్ మీరు నిల్వ చేసిన లక్షణాలు మరియు ANI లేదా కస్టమర్ ఐడి వాడుతుంది. ఫోన్ నంబర్‌కు బదిలీ చేస్తే అవతల Salesforce ఆ లక్షణాలు చూడదు.",
    ],
    points: [
      "కేసుకు ఒక రికార్డు వ్యవస్థ.",
      "సర్వర్‌లేని యాప్‌కు IAM పాత్ర ఉంది. సమీక్షించండి.",
      "శాండ్‌బాక్స్, తర్వాత ప్రొడక్షన్.",
      "అవుట్‌బౌండ్ క్లిక్-టు-డయల్ పరీక్షించండి. అది కాలర్ ఐడి నియమాలు వాడుతుంది.",
    ],
    mistake: "CCP పొదిగి మరో సాఫ్ట్‌ఫోన్ కూడా నడపడం.",
  },
  ar: {
    why: "الصوت يبقى على Connect. السؤال أي نظام يملك القنوات الرقمية والقضية.",
    paras: [
      "CTI Adapter حزمة مُدارة وتطبيق بلا خادم يضمّن CCP في Salesforce. ثبّته أولًا في صندوق رمل. Salesforce Contact Center with Amazon Connect يذهب أبعد: الهاتف وصوت التطبيق يبقيان أصليين لـ Connect، والرسائل قد تكون لأي المنصتين. المؤسسة تحتاج Service Cloud Voice، والميزات الرقمية تحتاج Digital Engagement.",
      "انبثاق الشاشة يستخدم السمات التي خزنتها وANI أو معرّف العميل. إن حوّلت إلى رقم هاتف فلن يرى Salesforce في الطرف الآخر تلك السمات.",
    ],
    points: [
      "نظام سجل واحد للقضية.",
      "التطبيق بلا خادم له دور IAM. راجعه.",
      "صندوق الرمل، ثم الإنتاج.",
      "اختبر النقر للاتصال الصادر. يستخدم قواعد معرّف المتصل.",
    ],
    mistake: "تضمين CCP وتشغيل هاتف برمجي ثانٍ أيضًا.",
  },
});

put("eco-why", {
  es: {
    why: "WFM, la calidad, la ubicación de emergencia y el CRM fallan en silencio cuando se atornillan después de la puesta en marcha.",
    paras: [
      "Connect posee el contacto en vivo. La previsión y la programación poseen el turno. La grabación y las evaluaciones poseen la prueba. Los perfiles y el CRM poseen a la persona. E911 posee la ubicación del agente durante una llamada al 911. La asistencia de IA posee una recomendación, no la decisión.",
      "El mapa mental de esta pista es la imagen que pones en la pared. El glosario es el diccionario que impide que dos equipos usen cola para seis objetos distintos.",
    ],
    points: [
      "Cada sistema hermano debe guardar ContactId o no se puede auditar.",
      "Elige un sistema de registro para el caso.",
      "Elige una alimentación de adherencia: eventos de agente.",
      "Elige un diseño de emergencia por tipo de agente: teléfono de escritorio o CCP.",
    ],
    mistake: "Una lista de puesta en marcha que termina en el agente contestó una llamada.",
  },
  fr: {
    why: "WFM, la qualité, la localisation d'urgence et le CRM échouent en silence quand on les visse après la mise en service.",
    paras: [
      "Connect possède le contact vivant. Prévision et planification possèdent le quart. Enregistrement et évaluations possèdent la preuve. Profils et CRM possèdent la personne. E911 possède l'emplacement de l'agent pendant un appel au 911. L'assistance IA possède une recommandation, pas la décision.",
      "La carte mentale de cette piste est l'image que vous mettez au mur. Le glossaire est le dictionnaire qui empêche deux équipes d'utiliser file pour six objets différents.",
    ],
    points: [
      "Chaque système frère doit stocker ContactId sinon il n'est pas auditable.",
      "Choisissez un système d'enregistrement pour le dossier.",
      "Choisissez un flux d'adhérence : les événements agent.",
      "Choisissez un dessin d'urgence par sorte d'agent : téléphone de bureau ou CCP.",
    ],
    mistake: "Une liste de mise en service qui s'arrête à l'agent a répondu à un appel.",
  },
  de: {
    why: "WFM, Qualität, Notfallort und CRM scheitern leise, wenn sie nach dem Go-live angeschraubt werden.",
    paras: [
      "Connect besitzt den lebenden Kontakt. Prognose und Planung besitzen die Schicht. Aufnahme und Bewertungen besitzen den Beweis. Profile und das CRM besitzen die Person. E911 besitzt den Ort des Agenten während eines 911-Anrufs. KI-Assistenz besitzt eine Empfehlung, nicht die Entscheidung.",
      "Die Mindmap dieser Spur ist das Bild an der Wand. Das Glossar ist das Wörterbuch, das zwei Teams hindert, Queue für sechs verschiedene Objekte zu sagen.",
    ],
    points: [
      "Jedes Schwester-System muss ContactId speichern, sonst ist es nicht prüfbar.",
      "Ein System of Record für den Fall wählen.",
      "Einen Adherence-Feed wählen: Agentenereignisse.",
      "Ein Notfalldesign je Agentenart wählen: Tischtelefon oder CCP.",
    ],
    mistake: "Eine Go-live-Liste, die bei Agent hat einen Anruf angenommen endet.",
  },
  ja: {
    why: "WFM、品質、緊急位置、CRM は本番のあとでボルト止めすると静かに失敗します。",
    paras: [
      "生きたコンタクトは Connect が持ちます。予測とスケジュールがシフトを持ちます。録音と評価が証拠を持ちます。プロファイルと CRM が人を持ちます。911 通話中のエージェントの位置は E911 が持ちます。AI アシストは推奨を持ち、決定は持ちません。",
      "このトラックのマインドマップは壁に貼る絵です。用語集は、二つのチームが六つの別物をキューと呼ぶのを止める辞書です。",
    ],
    points: [
      "姉妹システムは ContactId を保存しないと監査できません。",
      "ケースの記録システムを一つ選びます。",
      "遵守のフィードを一つ選びます。エージェントイベントです。",
      "エージェントの種類ごとに緊急設計を一つ選びます。卓上電話か CCP か。",
    ],
    mistake: "エージェントが電話に出たで終わる本番チェックリスト。",
  },
  hi: {
    why: "WFM, गुणवत्ता, आपात स्थान और CRM चुपचाप विफल होते हैं जब गो-लाइव के बाद बोल्ट किए जाएँ।",
    paras: [
      "जीवित संपर्क Connect का है। पूर्वानुमान और शेड्यूल पाली के हैं। रिकॉर्डिंग और मूल्यांकन प्रमाण के हैं। प्रोफ़ाइल और CRM व्यक्ति के हैं। 911 कॉल के दौरान एजेंट का स्थान E911 का है। AI सहायता सिफ़ारिश की है, निर्णय की नहीं।",
      "इस ट्रैक का मन-नक्शा वह चित्र है जो दीवार पर लगता है। शब्दावली वह शब्दकोश है जो दो टीमों को छह अलग वस्तुओं के लिए कतार कहने से रोकता है।",
    ],
    points: [
      "हर बहन प्रणाली को ContactId सहेजना होगा वरना ऑडिट नहीं होता।",
      "केस के लिए एक अभिलेख प्रणाली चुनें।",
      "एक अनुपालन फ़ीड चुनें: एजेंट घटनाएँ।",
      "एजेंट की तरह के अनुसार एक आपात डिज़ाइन चुनें: डेस्क फ़ोन या CCP।",
    ],
    mistake: "ऐसी गो-लाइव सूची जो एजेंट ने कॉल उठाया पर समाप्त हो।",
  },
  te: {
    why: "WFM, నాణ్యత, అత్యవసర స్థానం, CRM గో-లైవ్ తర్వాత బోల్ట్ చేస్తే నిశ్శబ్దంగా విఫలమవుతాయి.",
    paras: [
      "సజీవ కాంటాక్ట్ Connect సొంతం. అంచనా మరియు షెడ్యూల్ షిఫ్ట్ సొంతం. రికార్డింగ్ మరియు మూల్యాంకనాలు రుజువు సొంతం. ప్రొఫైల్‌లు మరియు CRM వ్యక్తి సొంతం. 911 కాల్ సమయంలో ఏజెంట్ స్థానం E911 సొంతం. AI సహాయం సిఫార్సు సొంతం, నిర్ణయం కాదు.",
      "ఈ ట్రాక్ మైండ్ మ్యాప్ గోడపై పెట్టే చిత్రం. పదకోశం రెండు జట్లు ఆరు వేరు వస్తువులకు క్యూ అనకుండా ఆపే నిఘంటువు.",
    ],
    points: [
      "ప్రతి సోదరి వ్యవస్థ ContactId నిల్వ చేయాలి, లేకపోతే ఆడిట్ కాదు.",
      "కేసుకు ఒక రికార్డు వ్యవస్థ ఎంచుకోండి.",
      "ఒక అనుసరణ ఫీడ్ ఎంచుకోండి: ఏజెంట్ ఈవెంట్‌లు.",
      "ఏజెంట్ రకానికి ఒక అత్యవసర డిజైన్ ఎంచుకోండి: డెస్క్ ఫోన్ లేదా CCP.",
    ],
    mistake: "ఏజెంట్ కాల్ ఎత్తారు వద్ద ముగిసే గో-లైవ్ జాబితా.",
  },
  ar: {
    why: "WFM والجودة وموقع الطوارئ وCRM تفشل بهدوء حين تُثبت بعد الإطلاق.",
    paras: [
      "Connect يملك الجهة الحية. التنبؤ والجدولة يملكان الوردية. التسجيل والتقييمات يملكان البرهان. الملفات وCRM يملكان الشخص. E911 يملك موقع الوكيل أثناء مكالمة 911. مساعدة الذكاء تملك توصية، لا القرار.",
      "خريطة الذهن في هذا المسار هي الصورة التي تضعها على الجدار. المسرد هو القاموس الذي يمنع فريقين من استخدام طابور لستة كائنات مختلفة.",
    ],
    points: [
      "كل نظام شقيق يجب أن يخزّن ContactId وإلا لا يُراجَع.",
      "اختر نظام سجل واحدًا للقضية.",
      "اختر تغذية التزام واحدة: أحداث الوكيل.",
      "اختر تصميم طوارئ واحدًا لكل نوع وكيل: هاتف مكتب أو CCP.",
    ],
    mistake: "قائمة إطلاق تنتهي عند أجاب الوكيل على مكالمة.",
  },
});

export function lessonBody(lang, id) {
  const pack = BODIES[id];
  if (!pack || !lang || lang === "en") return null;
  return pack[lang] || null;
}

export function bodyNote(lang, translated) {
  const note = NOTES[lang];
  if (!note) return "";
  return translated ? note.yes : note.no;
}
