export interface VocabWord {
  word: string;
  definition: string;
  example: string;
  partOfSpeech: string;
}

export interface DailySet {
  day: number;
  words: VocabWord[];
}

export const GRE_VOCAB_SETS: DailySet[] = [
  {
    day: 1,
    words: [
      { word: "Aberrant", partOfSpeech: "adj", definition: "Deviating from what is normal or expected", example: "The scientist noted aberrant behavior in the test subjects." },
      { word: "Abscond", partOfSpeech: "v", definition: "To leave hurriedly and secretly, usually to avoid detection", example: "The treasurer absconded with the company funds." },
      { word: "Acerbic", partOfSpeech: "adj", definition: "Sharp and forthright; harsh or severe in tone", example: "Her acerbic wit made her both feared and admired." },
      { word: "Acrimony", partOfSpeech: "n", definition: "Bitterness or ill feeling, especially in speech or manner", example: "The divorce was settled with much acrimony." },
      { word: "Alacrity", partOfSpeech: "n", definition: "Brisk and cheerful readiness; eagerness", example: "She accepted the invitation with alacrity." },
      { word: "Ameliorate", partOfSpeech: "v", definition: "To make something bad or unsatisfactory better", example: "The new policies were meant to ameliorate working conditions." },
      { word: "Anachronism", partOfSpeech: "n", definition: "A thing belonging to a period other than that in which it exists", example: "A sword fight in a modern city would be an anachronism." },
    ],
  },
  {
    day: 2,
    words: [
      { word: "Anathema", partOfSpeech: "n", definition: "Something or someone greatly detested or loathed", example: "Dishonesty was anathema to her." },
      { word: "Anomaly", partOfSpeech: "n", definition: "Something that deviates from what is standard or expected", example: "The data contained one puzzling anomaly." },
      { word: "Antipathy", partOfSpeech: "n", definition: "A deep-seated feeling of dislike or aversion", example: "He had a strong antipathy toward confrontation." },
      { word: "Apposite", partOfSpeech: "adj", definition: "Apt in the circumstances; well-suited", example: "His apposite remark perfectly captured the mood." },
      { word: "Arcane", partOfSpeech: "adj", definition: "Understood by few; mysterious or secret", example: "The professor specialized in arcane medieval texts." },
      { word: "Arduous", partOfSpeech: "adj", definition: "Involving or requiring strenuous effort; difficult", example: "Climbing the mountain was an arduous task." },
      { word: "Ascetic", partOfSpeech: "adj/n", definition: "Characterized by severe self-discipline; a person who practices this", example: "The monk led an ascetic life, owning nothing." },
    ],
  },
  {
    day: 3,
    words: [
      { word: "Assiduous", partOfSpeech: "adj", definition: "Showing great care and perseverance; diligent", example: "She was assiduous in her GRE preparation." },
      { word: "Astute", partOfSpeech: "adj", definition: "Having an ability to accurately assess situations; shrewd", example: "An astute investor, he sensed the market shift early." },
      { word: "Attenuate", partOfSpeech: "v", definition: "To reduce the force, effect, or value of something", example: "The thick walls attenuated the sound from outside." },
      { word: "Audacious", partOfSpeech: "adj", definition: "Showing a willingness to take bold risks; daring", example: "The audacious plan seemed impossible, but it worked." },
      { word: "Auspicious", partOfSpeech: "adj", definition: "Conducive to success; favorable", example: "It was an auspicious start to their partnership." },
      { word: "Avarice", partOfSpeech: "n", definition: "Extreme greed for wealth or material gain", example: "His avarice led him to betray his closest friends." },
      { word: "Banal", partOfSpeech: "adj", definition: "So lacking in originality as to be obvious and boring", example: "The speech was full of banal platitudes." },
    ],
  },
  {
    day: 4,
    words: [
      { word: "Belligerent", partOfSpeech: "adj", definition: "Hostile and aggressive; inclined to fight", example: "The belligerent nation refused all diplomatic overtures." },
      { word: "Bombastic", partOfSpeech: "adj", definition: "High-sounding language with little meaning; inflated", example: "His bombastic speech impressed no one." },
      { word: "Brevity", partOfSpeech: "n", definition: "Concise and exact use of words; briefness", example: "Brevity is the soul of wit, as Shakespeare wrote." },
      { word: "Burgeon", partOfSpeech: "v", definition: "To begin to grow or increase rapidly; flourish", example: "The tech startup began to burgeon after its first product launch." },
      { word: "Cacophony", partOfSpeech: "n", definition: "A harsh, discordant mixture of sounds", example: "The construction site produced a cacophony of noise." },
      { word: "Capricious", partOfSpeech: "adj", definition: "Given to sudden and unaccountable changes of mood; impulsive", example: "The capricious weather ruined the outdoor event." },
      { word: "Castigate", partOfSpeech: "v", definition: "To reprimand someone severely", example: "The coach castigated the team for their poor performance." },
    ],
  },
  {
    day: 5,
    words: [
      { word: "Caustic", partOfSpeech: "adj", definition: "Sarcastic in a scathing and bitter way", example: "Her caustic review devastated the author." },
      { word: "Chicanery", partOfSpeech: "n", definition: "The use of trickery to achieve one's purpose", example: "The election was marred by chicanery and fraud." },
      { word: "Circumspect", partOfSpeech: "adj", definition: "Wary and unwilling to take risks; careful", example: "Be circumspect when signing contracts." },
      { word: "Clemency", partOfSpeech: "n", definition: "Mercy and leniency shown toward offenders or enemies", example: "The judge showed clemency to the first-time offender." },
      { word: "Coalesce", partOfSpeech: "v", definition: "To come together to form one mass or whole", example: "The various factions coalesced into a unified party." },
      { word: "Cogent", partOfSpeech: "adj", definition: "Clear, logical, and convincing", example: "She presented a cogent argument for the policy change." },
      { word: "Complacent", partOfSpeech: "adj", definition: "Showing smug, uncritical satisfaction with oneself", example: "Success made him complacent and eventually led to his downfall." },
    ],
  },
  {
    day: 6,
    words: [
      { word: "Contentious", partOfSpeech: "adj", definition: "Causing or likely to cause argument; controversial", example: "Immigration is a contentious political issue." },
      { word: "Contrite", partOfSpeech: "adj", definition: "Feeling or expressing remorse at having done wrong", example: "He was genuinely contrite after hurting his friend." },
      { word: "Convoluted", partOfSpeech: "adj", definition: "Extremely complex and difficult to follow", example: "The convoluted legal document confused everyone." },
      { word: "Credulous", partOfSpeech: "adj", definition: "Having too great a readiness to believe things", example: "A credulous person is easily deceived by scammers." },
      { word: "Culpable", partOfSpeech: "adj", definition: "Deserving blame or censure; at fault", example: "He was found culpable in the accident." },
      { word: "Dearth", partOfSpeech: "n", definition: "A scarcity or lack of something", example: "There is a dearth of qualified engineers in the region." },
      { word: "Decorum", partOfSpeech: "n", definition: "Behavior in keeping with good taste and propriety", example: "The audience maintained decorum throughout the ceremony." },
    ],
  },
  {
    day: 7,
    words: [
      { word: "Denigrate", partOfSpeech: "v", definition: "To criticize unfairly; disparage", example: "He denigrated his opponent's achievements." },
      { word: "Desultory", partOfSpeech: "adj", definition: "Lacking a plan, purpose, or enthusiasm; haphazard", example: "The meeting was desultory, with no clear agenda." },
      { word: "Didactic", partOfSpeech: "adj", definition: "Intended to teach, particularly morally; preachy", example: "The novel was too didactic to be enjoyable." },
      { word: "Diffident", partOfSpeech: "adj", definition: "Modest or shy due to lack of self-confidence", example: "The diffident student rarely spoke up in class." },
      { word: "Dilettante", partOfSpeech: "n", definition: "A person who cultivates an area without real commitment", example: "He was a dilettante in art, never mastering any style." },
      { word: "Dissonance", partOfSpeech: "n", definition: "Lack of harmony; inconsistency or conflict", example: "Cognitive dissonance occurs when beliefs contradict actions." },
      { word: "Dogmatic", partOfSpeech: "adj", definition: "Inclined to lay down principles as incontrovertibly true", example: "His dogmatic approach alienated open-minded colleagues." },
    ],
  },
  {
    day: 8,
    words: [
      { word: "Ebullient", partOfSpeech: "adj", definition: "Cheerful and full of energy; exuberant", example: "Her ebullient personality lit up every room." },
      { word: "Efficacious", partOfSpeech: "adj", definition: "Successful in producing a desired or intended result", example: "The new drug proved efficacious in clinical trials." },
      { word: "Egregious", partOfSpeech: "adj", definition: "Outstandingly bad; shocking", example: "The judge condemned the egregious violation of rights." },
      { word: "Elusive", partOfSpeech: "adj", definition: "Difficult to find, catch, or achieve", example: "The solution to the equation remained elusive." },
      { word: "Enervate", partOfSpeech: "v", definition: "To weaken; to drain of energy or vitality", example: "The extreme heat enervated the hikers." },
      { word: "Ephemeral", partOfSpeech: "adj", definition: "Lasting for a very short time; transitory", example: "Social media fame is often ephemeral." },
      { word: "Equivocal", partOfSpeech: "adj", definition: "Open to more than one interpretation; ambiguous", example: "The politician gave an equivocal answer." },
    ],
  },
  {
    day: 9,
    words: [
      { word: "Erudite", partOfSpeech: "adj", definition: "Having or showing great knowledge or learning", example: "The erudite professor published dozens of papers." },
      { word: "Esoteric", partOfSpeech: "adj", definition: "Intended for or understood by a small group with specialized knowledge", example: "Quantum mechanics can seem esoteric to non-scientists." },
      { word: "Euphemism", partOfSpeech: "n", definition: "A mild or indirect word substituted for one too harsh", example: "'Passed away' is a euphemism for 'died.'" },
      { word: "Exacerbate", partOfSpeech: "v", definition: "To make a problem, bad situation, or negative feeling worse", example: "The drought exacerbated the food crisis." },
      { word: "Exculpate", partOfSpeech: "v", definition: "To show or declare that someone is not guilty of wrongdoing", example: "New evidence exculpated the defendant." },
      { word: "Exigent", partOfSpeech: "adj", definition: "Pressing; demanding immediate action", example: "The exigent circumstances required a swift response." },
      { word: "Expedient", partOfSpeech: "adj", definition: "Convenient and practical, though possibly improper", example: "It was expedient to ignore the long-term consequences." },
    ],
  },
  {
    day: 10,
    words: [
      { word: "Facile", partOfSpeech: "adj", definition: "Appearing neat and effortless but lacking depth", example: "His facile solution ignored the real complexity." },
      { word: "Fallacious", partOfSpeech: "adj", definition: "Based on a mistaken belief; misleading", example: "The fallacious argument was quickly exposed." },
      { word: "Fastidious", partOfSpeech: "adj", definition: "Very attentive to accuracy and detail; meticulous", example: "She was fastidious about keeping her workspace clean." },
      { word: "Fatuous", partOfSpeech: "adj", definition: "Silly and pointless; complacently foolish", example: "He made a fatuous remark that nobody took seriously." },
      { word: "Fecund", partOfSpeech: "adj", definition: "Producing many offspring or ideas; fertile", example: "The fecund author published three novels a year." },
      { word: "Felicitous", partOfSpeech: "adj", definition: "Well-chosen or suited to the circumstances; pleasing", example: "A felicitous phrase can elevate any speech." },
      { word: "Feral", partOfSpeech: "adj", definition: "In a wild or untamed state; savage", example: "Feral cats survive without human care." },
    ],
  },
  {
    day: 11,
    words: [
      { word: "Furtive", partOfSpeech: "adj", definition: "Attempting to avoid notice; secretive", example: "He cast a furtive glance over his shoulder." },
      { word: "Garrulous", partOfSpeech: "adj", definition: "Excessively talkative, especially on trivial matters", example: "The garrulous neighbor talked for hours." },
      { word: "Germane", partOfSpeech: "adj", definition: "Relevant to a subject under consideration", example: "Her comments were germane to the discussion." },
      { word: "Grandiose", partOfSpeech: "adj", definition: "Impressive in appearance, but excessively grand or ambitious", example: "His grandiose plans never materialized." },
      { word: "Gratuitous", partOfSpeech: "adj", definition: "Uncalled for; lacking good reason; unwarranted", example: "The film contained gratuitous violence." },
      { word: "Gregarious", partOfSpeech: "adj", definition: "Fond of company; sociable", example: "She was gregarious and thrived at parties." },
      { word: "Guile", partOfSpeech: "n", definition: "Sly or cunning intelligence; craftiness", example: "He used guile rather than force to achieve his goals." },
    ],
  },
  {
    day: 12,
    words: [
      { word: "Hackneyed", partOfSpeech: "adj", definition: "Made meaningless by overuse; clichéd", example: "The essay was full of hackneyed phrases." },
      { word: "Harangue", partOfSpeech: "n/v", definition: "A lengthy aggressive speech; to lecture someone aggressively", example: "The coach harangued the team after their defeat." },
      { word: "Hegemony", partOfSpeech: "n", definition: "Leadership or dominance, especially of one country or group", example: "The nation sought cultural hegemony over its neighbors." },
      { word: "Heresy", partOfSpeech: "n", definition: "Belief contrary to orthodox religious doctrine; controversial opinion", example: "Challenging the theory was considered heresy in the lab." },
      { word: "Iconoclast", partOfSpeech: "n", definition: "A person who attacks cherished beliefs or institutions", example: "The iconoclast artist rejected all traditional forms." },
      { word: "Idiosyncrasy", partOfSpeech: "n", definition: "A mode of behavior or thinking peculiar to an individual", example: "Her habit of humming was an endearing idiosyncrasy." },
      { word: "Imperturbable", partOfSpeech: "adj", definition: "Unable to be upset or excited; calm", example: "The surgeon remained imperturbable throughout the crisis." },
    ],
  },
  {
    day: 13,
    words: [
      { word: "Impetuous", partOfSpeech: "adj", definition: "Acting or done quickly without thought; impulsive", example: "His impetuous decision cost him dearly." },
      { word: "Implacable", partOfSpeech: "adj", definition: "Unable to be appeased or pacified; relentless", example: "She faced the implacable opposition of the committee." },
      { word: "Inchoate", partOfSpeech: "adj", definition: "Just begun and not fully formed or developed; rudimentary", example: "She had an inchoate plan but no clear steps." },
      { word: "Incisive", partOfSpeech: "adj", definition: "Intelligently analytical and clear-thinking; sharp", example: "His incisive commentary cut through the confusion." },
      { word: "Incorrigible", partOfSpeech: "adj", definition: "Not able to be corrected, improved, or reformed", example: "The incorrigible optimist refused to see obstacles." },
      { word: "Indolent", partOfSpeech: "adj", definition: "Wanting to avoid activity or exertion; lazy", example: "Indolent students rarely reach their potential." },
      { word: "Ineffable", partOfSpeech: "adj", definition: "Too great or extreme to be expressed in words", example: "The beauty of the landscape was ineffable." },
    ],
  },
  {
    day: 14,
    words: [
      { word: "Inimical", partOfSpeech: "adj", definition: "Tending to obstruct or harm; unfriendly; hostile", example: "Pollution is inimical to public health." },
      { word: "Insipid", partOfSpeech: "adj", definition: "Lacking vigor or interest; dull", example: "The insipid plot put the audience to sleep." },
      { word: "Intractable", partOfSpeech: "adj", definition: "Hard to control or deal with; stubborn", example: "The conflict seemed intractable after years of failed talks." },
      { word: "Inveterate", partOfSpeech: "adj", definition: "Having a habit, activity, or interest of long standing", example: "He was an inveterate traveler who never stayed home." },
      { word: "Irascible", partOfSpeech: "adj", definition: "Having or showing a tendency to be easily angered", example: "The irascible boss terrified new employees." },
      { word: "Laconic", partOfSpeech: "adj", definition: "Using very few words; brief and concise", example: "His laconic reply was just: 'No.'" },
      { word: "Languid", partOfSpeech: "adj", definition: "Displaying or having a disinclination for physical effort; slow and relaxed", example: "She moved with a languid grace." },
    ],
  },
  {
    day: 15,
    words: [
      { word: "Laud", partOfSpeech: "v", definition: "To praise highly, especially in a public context", example: "Critics lauded the director's bold new film." },
      { word: "Loquacious", partOfSpeech: "adj", definition: "Tending to talk a great deal; talkative", example: "A loquacious politician never answers directly." },
      { word: "Lucid", partOfSpeech: "adj", definition: "Expressed clearly; easy to understand", example: "Her lucid explanation made the topic accessible." },
      { word: "Malevolent", partOfSpeech: "adj", definition: "Having or showing a wish to do evil to others", example: "The villain had a malevolent smile." },
      { word: "Malleable", partOfSpeech: "adj", definition: "Easily influenced; pliable; capable of being shaped", example: "Young minds are more malleable than adult ones." },
      { word: "Mendacious", partOfSpeech: "adj", definition: "Not telling the truth; lying", example: "The mendacious politician lost all credibility." },
      { word: "Misanthrope", partOfSpeech: "n", definition: "A person who dislikes humankind in general", example: "The hermit was a misanthrope who shunned all contact." },
    ],
  },
  {
    day: 16,
    words: [
      { word: "Mitigate", partOfSpeech: "v", definition: "To make less severe, serious, or painful", example: "Exercise can mitigate the effects of stress." },
      { word: "Morose", partOfSpeech: "adj", definition: "Sullen and ill-tempered; gloomy", example: "He became morose after his project was rejected." },
      { word: "Mundane", partOfSpeech: "adj", definition: "Lacking interest or excitement; dull; ordinary", example: "She longed for adventure beyond her mundane routine." },
      { word: "Nefarious", partOfSpeech: "adj", definition: "Wicked or criminal in nature", example: "The nefarious scheme was uncovered by investigators." },
      { word: "Obdurate", partOfSpeech: "adj", definition: "Stubbornly refusing to change one's opinion or course of action", example: "Despite the evidence, he remained obdurate." },
      { word: "Obsequious", partOfSpeech: "adj", definition: "Obedient or attentive to an excessive or servile degree; sycophantic", example: "The obsequious assistant agreed with everything his boss said." },
      { word: "Obtuse", partOfSpeech: "adj", definition: "Annoyingly insensitive or slow to understand", example: "He was being deliberately obtuse to avoid the question." },
    ],
  },
  {
    day: 17,
    words: [
      { word: "Ostracize", partOfSpeech: "v", definition: "To exclude from a society or group", example: "After the scandal, he was ostracized by former friends." },
      { word: "Panacea", partOfSpeech: "n", definition: "A solution or remedy for all difficulties; cure-all", example: "Technology is not a panacea for social problems." },
      { word: "Paradox", partOfSpeech: "n", definition: "A statement that contradicts itself but may be true", example: "It's a paradox that the more choices we have, the less satisfied we feel." },
      { word: "Parsimony", partOfSpeech: "n", definition: "Extreme unwillingness to spend money; stinginess", example: "His parsimony meant he never bought gifts for anyone." },
      { word: "Pedantic", partOfSpeech: "adj", definition: "Excessively concerned with minor details; overly academic", example: "His pedantic corrections annoyed his colleagues." },
      { word: "Penchant", partOfSpeech: "n", definition: "A strong habitual liking for something; inclination", example: "She had a penchant for collecting rare books." },
      { word: "Perfidious", partOfSpeech: "adj", definition: "Deceitful and untrustworthy; guilty of betrayal", example: "A perfidious ally is more dangerous than an enemy." },
    ],
  },
  {
    day: 18,
    words: [
      { word: "Pervasive", partOfSpeech: "adj", definition: "Spreading widely through something; prevalent", example: "Social media has a pervasive influence on culture." },
      { word: "Petulant", partOfSpeech: "adj", definition: "Childishly sulky or bad-tempered; irritable", example: "His petulant refusal to cooperate frustrated the team." },
      { word: "Phlegmatic", partOfSpeech: "adj", definition: "Having an unemotional and stolidly calm disposition", example: "The phlegmatic leader never panicked under pressure." },
      { word: "Plausible", partOfSpeech: "adj", definition: "Seeming reasonable or probable; credible", example: "The alibi was plausible but ultimately false." },
      { word: "Pragmatic", partOfSpeech: "adj", definition: "Dealing with things sensibly and realistically", example: "A pragmatic approach focuses on what actually works." },
      { word: "Propitious", partOfSpeech: "adj", definition: "Giving or indicating a good chance of success; favorable", example: "The calm weather was propitious for sailing." },
      { word: "Repudiate", partOfSpeech: "v", definition: "To refuse to accept; reject as having no authority", example: "She repudiated the accusations against her." },
    ],
  },
  {
    day: 19,
    words: [
      { word: "Reticent", partOfSpeech: "adj", definition: "Not revealing one's thoughts or feelings readily; reserved", example: "He was reticent about discussing his past." },
      { word: "Sagacious", partOfSpeech: "adj", definition: "Having or showing keen mental discernment; wise", example: "The sagacious investor anticipated the market crash." },
      { word: "Sanguine", partOfSpeech: "adj", definition: "Optimistic, especially in a difficult situation", example: "She remained sanguine despite the setbacks." },
      { word: "Sardonic", partOfSpeech: "adj", definition: "Grimly mocking or cynical", example: "A sardonic smile crossed his face at the irony." },
      { word: "Sycophant", partOfSpeech: "n", definition: "A person who acts excessively complimentary to gain favor; flatterer", example: "The CEO was surrounded by sycophants who never challenged him." },
      { word: "Taciturn", partOfSpeech: "adj", definition: "Reserved or uncommunicative in speech; saying little", example: "The taciturn detective let the evidence speak for itself." },
      { word: "Temerity", partOfSpeech: "n", definition: "Excessive confidence or boldness; audacity", example: "He had the temerity to challenge the board's decision." },
    ],
  },
  {
    day: 20,
    words: [
      { word: "Tenacious", partOfSpeech: "adj", definition: "Holding firmly to something; persistent", example: "Her tenacious pursuit of justice never wavered." },
      { word: "Torpor", partOfSpeech: "n", definition: "A state of physical or mental inactivity; sluggishness", example: "The summer heat induced a pleasant torpor." },
      { word: "Truculent", partOfSpeech: "adj", definition: "Eager or quick to argue or fight; aggressively defiant", example: "The truculent student challenged every rule." },
      { word: "Ubiquitous", partOfSpeech: "adj", definition: "Present, appearing, or found everywhere", example: "Smartphones have become ubiquitous in modern life." },
      { word: "Umbrage", partOfSpeech: "n", definition: "Offense or annoyance at something", example: "She took umbrage at his dismissive tone." },
      { word: "Vacuous", partOfSpeech: "adj", definition: "Having or showing a lack of thought or intelligence; empty", example: "His vacuous stare suggested he hadn't understood a word." },
      { word: "Venerate", partOfSpeech: "v", definition: "To regard with great respect; revere", example: "The community venerated the elder's wisdom." },
    ],
  },
  {
    day: 21,
    words: [
      { word: "Verbose", partOfSpeech: "adj", definition: "Using more words than needed; wordy", example: "His verbose emails could always be cut in half." },
      { word: "Veracious", partOfSpeech: "adj", definition: "Speaking or representing the truth; truthful", example: "A veracious witness is invaluable in court." },
      { word: "Vituperative", partOfSpeech: "adj", definition: "Bitter and abusive in language; harshly critical", example: "The vituperative review crushed the debut novel." },
      { word: "Volatile", partOfSpeech: "adj", definition: "Liable to change rapidly and unpredictably; unstable", example: "The volatile situation required careful diplomacy." },
      { word: "Wanton", partOfSpeech: "adj", definition: "Deliberate and unprovoked; licentious; extravagant", example: "The wanton destruction of the habitat shocked environmentalists." },
      { word: "Zealot", partOfSpeech: "n", definition: "A fanatical and uncompromising pursuer of a cause", example: "A zealot for fitness, she trained every single day." },
      { word: "Zeal", partOfSpeech: "n", definition: "Great energy or enthusiasm in pursuit of a cause", example: "She approached her GRE prep with incredible zeal." },
    ],
  },
];
