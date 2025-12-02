import db from './db';
import type { QuizBankItem } from './types';

const now = () => new Date().toISOString();

// Earth and Space - Multiple Choice Questions
const earthSpaceMC = [
  {
    question: "Scenario: A coastal town experiences unusually high tides during a particular month. The newspaper suggests this is due to a special alignment of the Earth, Moon, and Sun. Which alignment is most likely to produce the highest tides?",
    options: ["A. Quarter Moon phase, 90 deg. alignment.", "B. New Moon or Full Moon phase, nearly straight alignment.", "C. Gibbous Moon phase, 120 deg. alignment.", "D. Crescent Moon phase, close to the Sun."],
    answer: "B",
    category: "Earth and Space"
  },
  {
    question: "Data Analysis: If the time is 12:00 PM (noon) at location R on Earth, what time and condition are most likely being experienced at a location 90deg. to the west?",
    options: ["A. 6:00 AM, Sunrise.", "B. 6:00 PM, Sunset.", "C. 12:00 AM, Midnight.", "D. 9:00 AM, Morning."],
    answer: "D",
    category: "Earth and Space"
  },
  {
    question: "Application: An astronaut takes a scoop of moon dust. Compared to a scoop of the same volume of Earth soil, the moon dust weighs significantly less. What is the primary scientific reason for this difference in weight?",
    options: ["A. The Moon's gravity is much weaker than Earth's gravity.", "B. Moon dust has a lower density than Earth soil.", "C. The Moon has no atmosphere to press down on the dust.", "D. The Earth is spinning, which increases the weight of objects."],
    answer: "A",
    category: "Earth and Space"
  },
  {
    question: "Problem-Solving: If the Earth's rotation suddenly stopped, but its revolution around the Sun continued, what would be the most immediate and drastic effect on weather patterns?",
    options: ["A. Seasons would become much shorter.", "B. The year length would dramatically increase.", "C. Day and night cycles would be much longer, resulting in extreme temperature differences.", "D. The Moon's phases would stop changing."],
    answer: "C",
    category: "Earth and Space"
  },
  {
    question: "Evaluation: A student claims that the Earth is at the center of the solar system because the Sun appears to move across the sky every day. Which statement provides the best scientific evidence to refute this claim?",
    options: ["A. Other planets also appear to move across the sky.", "B. Telescopic observations show Jupiter has its own orbiting moons.", "C. The observed parallax shift of nearby stars proves Earth orbits the Sun.", "D. The Earth's magnetic field affects the appearance of celestial bodies."],
    answer: "C",
    category: "Earth and Space"
  },
  {
    question: "Conceptual Understanding: The Sun is classified as a star, while Jupiter is a planet. What is the key distinction that causes the Sun to emit its own light and heat, but Jupiter only reflects it?",
    options: ["A. The Sun is much larger than Jupiter.", "B. The Sun is made only of gas, while Jupiter is mostly rock.", "C. The Sun has a core hot enough for nuclear fusion, which planets lack.", "D. Jupiter is much farther away from Earth than the Sun."],
    answer: "C",
    category: "Earth and Space"
  },
  {
    question: "Inquiry: A team is planning to observe a celestial body. They know its position changes significantly over a few weeks, sometimes appearing in the morning sky and sometimes in the evening sky. Which type of celestial body is it most likely to be?",
    options: ["A. A distant star in a constellation.", "B. The Moon.", "C. A comet far from the Sun.", "D. A galaxy."],
    answer: "B",
    category: "Earth and Space"
  },
  {
    question: "Application: A student learns that tectonic plates move due to convection currents in the mantle. If a landmass is located near a divergent plate boundary, what geological activity would be most expected in that area?",
    options: ["A. Formation of high mountain ranges.", "B. Deep ocean trenches.", "C. Volcanic activity and formation of new crust.", "D. Frequent and very deep earthquakes."],
    answer: "C",
    category: "Earth and Space"
  },
  {
    question: "Synthesis: Which phenomenon is a direct result of the Earth being tilted on its axis as it revolves around the Sun?",
    options: ["A. Day and night cycles.", "B. The occurrence of seasons.", "C. The phases of the Moon.", "D. The cycle of ocean tides."],
    answer: "B",
    category: "Earth and Space"
  },
  {
    question: "Prediction: A new planet is discovered that has an orbit less elliptical (more circular) than Earth's. How would the temperature variation due to orbit on this new planet compare to Earth's?",
    options: ["A. The planet would have greater temperature variation.", "B. The planet would have less temperature variation.", "C. Temperature variation would be exactly the same.", "D. The temperature variation would depend only on the planet's rotation speed."],
    answer: "B",
    category: "Earth and Space"
  },
  {
    question: "Reasoning: Why is the presence of liquid water on a planet or moon considered the most crucial indicator for the potential existence of life as we know it?",
    options: ["A. Liquid water is the only substance that can dissolve rocks.", "B. It proves the celestial body has an atmosphere.", "C. Liquid water acts as a universal solvent and is essential for most biological chemical reactions.", "D. It helps in the reflection of sunlight, keeping the temperature stable."],
    answer: "C",
    category: "Earth and Space"
  },
  {
    question: "Contextual Application: A farmer wants to determine the best time to plant crops based on local climate patterns. Which layer of the Earth's atmosphere directly influences the weather and climate conditions the farmer needs to monitor?",
    options: ["A. Stratosphere.", "B. Thermosphere.", "C. Mesosphere.", "D. Troposphere."],
    answer: "D",
    category: "Earth and Space"
  },
  {
    question: "Interpretation: The Earth's inner core is solid, while the outer core is liquid. This is despite the inner core being at a higher temperature. What scientific principle explains this observation?",
    options: ["A. The inner core is made of different elements.", "B. The pressure at the inner core is high enough to keep the material in a solid state.", "C. The liquid outer core acts as an insulator for the inner core.", "D. The inner core is constantly cooled by the surrounding mantle."],
    answer: "B",
    category: "Earth and Space"
  },
  {
    question: "Analysis: Scientists are monitoring a region prone to earthquakes. They observe small tremors followed by a period of relative calm, and then a major earthquake. This pattern suggests:",
    options: ["A. The smaller tremors release enough energy to prevent the major quake.", "B. The tectonic plates are completely stationary after the tremors.", "C. Stress is building up along the fault line despite the initial small releases.", "D. The composition of the rocks in the area is changing rapidly."],
    answer: "C",
    category: "Earth and Space"
  },
  {
    question: "Creative Thinking: Imagine a new Earth-like planet is discovered. It has an axial tilt of 0° (no tilt). What would be the major consequence for the planet's seasons?",
    options: ["A. The seasons would be more severe (hotter summers, colder winters).", "B. The planet would experience no significant seasonal changes.", "C. The seasons would occur in a reverse pattern (summer in the north while it's winter in the south).", "D. The seasons would only be affected by the planet's distance from its star."],
    answer: "B",
    category: "Earth and Space"
  },
  {
    question: "Conceptual Understanding: What is the primary cause of the Earth's magnetic field?",
    options: ["A. The rotation of the tectonic plates.", "B. The interaction of the atmosphere with the solar wind.", "C. Convection currents and movement of liquid metal in the outer core.", "D. The alignment of the Earth's axis with the North Star."],
    answer: "C",
    category: "Earth and Space"
  },
  {
    question: "Application: If a scientist wants to measure the exact location of a city on Earth, which two imaginary lines must intersect to give the coordinates?",
    options: ["A. Tropic of Cancer and Tropic of Capricorn.", "B. Prime Meridian and Equator.", "C. Latitude and Longitude.", "D. Arctic Circle and Antarctic Circle."],
    answer: "C",
    category: "Earth and Space"
  },
  {
    question: "Analysis: A deep ocean trench is typically formed at which type of plate boundary?",
    options: ["A. Divergent boundary.", "B. Transform boundary.", "C. Convergent boundary (subduction zone).", "D. Hotspot."],
    answer: "C",
    category: "Earth and Space"
  },
  {
    question: "Problem-Solving: If a star suddenly exploded (a supernova) 100 light-years away, how long would it take for the light from that explosion to reach Earth?",
    options: ["A. 100 seconds.", "B. 1 year.", "C. 10 years.", "D. 100 years."],
    answer: "D",
    category: "Earth and Space"
  },
  {
    question: "Evaluation: Which statement about renewable resources provides the best scientific justification for their increased use?",
    options: ["A. They are cheaper to install than nonrenewable sources.", "B. They produce energy without using any water.", "C. They are naturally replenished over short timescales, minimizing resource depletion.", "D. They can only be used to generate electricity, not heat."],
    answer: "C",
    category: "Earth and Space"
  },
  {
    question: "Contextual Application: You are studying physical weathering in a cold environment. Which process is the best example of physical weathering in this climate?",
    options: ["A. Acid rain dissolving limestone.", "B. The cracking of rock caused by freezing and thawing of water (frost wedging).", "C. Rusting of iron-containing minerals.", "D. Tree roots absorbing minerals from the rock."],
    answer: "B",
    category: "Earth and Space"
  },
  {
    question: "Interpretation: The Prime Meridian represents 0° longitude. What is the approximate longitude of the International Date Line?",
    options: ["A. 0° E.", "B. 90° W.", "C. 90° E.", "D. 180° E/W."],
    answer: "D",
    category: "Earth and Space"
  },
  {
    question: "Synthesis: The primary composition of the gas giant planets (like Jupiter and Saturn) is different from the rocky inner planets (like Earth and Mars). The gas giants are mainly composed of:",
    options: ["A. Carbon and Iron.", "B. Silicon and Oxygen.", "C. Hydrogen and Helium.", "D. Water ice and Ammonia."],
    answer: "C",
    category: "Earth and Space"
  },
  {
    question: "Reasoning: Why does the greenhouse effect naturally keep Earth warm enough to sustain life?",
    options: ["A. The oceans absorb all of the Sun's heat.", "B. Greenhouse gases in the atmosphere trap some of the heat radiated from Earth's surface.", "C. Clouds reflect all sunlight back into space.", "D. The ozone layer converts UV light into heat."],
    answer: "B",
    category: "Earth and Space"
  },
  {
    question: "Inquiry: If you observe that during the day, the length of a shadow cast by a pole gets shorter and then longer, this is direct evidence of:",
    options: ["A. The Earth's revolution around the Sun.", "B. The Earth's tilt on its axis.", "C. The Earth's rotation on its axis.", "D. The changing phases of the Moon."],
    answer: "C",
    category: "Earth and Space"
  },
  {
    question: "Conceptual Understanding: A rock that forms from the cooling and solidification of molten material (magma or lava) is classified as a(n):",
    options: ["A. Sedimentary rock.", "B. Metamorphic rock.", "C. Igneous rock.", "D. Mineral."],
    answer: "C",
    category: "Earth and Space"
  },
  {
    question: "Application: Geothermal energy is generated by utilizing heat from which layer of the Earth?",
    options: ["A. Crust.", "B. Mantle/Core.", "C. Troposphere.", "D. Outer atmosphere."],
    answer: "B",
    category: "Earth and Space"
  },
  {
    question: "Analysis: Which of the following is an example of an unwise use or conservation of energy resources?",
    options: ["A. Using solar panels on a house.", "B. Leaving lights on in empty rooms.", "C. Constructing windmills in windy areas.", "D. Taking public transportation instead of driving alone."],
    answer: "B",
    category: "Earth and Space"
  },
  {
    question: "Prediction: If the Earth were to suddenly lose its atmosphere, what would be the immediate impact on its average surface temperature?",
    options: ["A. The temperature would significantly increase.", "B. The temperature would dramatically decrease, with huge swings between day and night.", "C. The temperature would remain constant.", "D. The temperature would only be affected by ocean currents."],
    answer: "B",
    category: "Earth and Space"
  },
  {
    question: "Creative Thinking: If humans colonized a planet with a rotational period of 100 Earth hours, how would the length of one planetary \"day\" compare to an Earth day?",
    options: ["A. It would be slightly shorter.", "B. It would be exactly the same length.", "C. It would be much longer.", "D. It would be exactly 24 Earth hours."],
    answer: "C",
    category: "Earth and Space"
  },
  {
    question: "Reasoning: Why is Venus significantly hotter than Mercury, even though Mercury is closer to the Sun?",
    options: ["A. Mercury has a much slower rotational speed.", "B. Venus has an extremely dense atmosphere composed mainly of carbon dioxide, leading to a runaway greenhouse effect.", "C. Venus is a gas giant, which naturally traps more heat.", "D. Mercury is tidally locked, causing one side to be perpetually cold."],
    answer: "B",
    category: "Earth and Space"
  },
  {
    question: "Interpretation: During a Lunar Eclipse, what is the relative position of the three celestial bodies?",
    options: ["A. Moon - Sun - Earth.", "B. Sun - Earth - Moon.", "C. Earth - Moon - Sun.", "D. Sun - Moon - Earth."],
    answer: "B",
    category: "Earth and Space"
  },
  {
    question: "Synthesis: The formation of canyons by flowing rivers over millions of years is primarily driven by which geological process?",
    options: ["A. Volcanism.", "B. Tectonics.", "C. Erosion and Weathering.", "D. Metamorphism."],
    answer: "C",
    category: "Earth and Space"
  },
  {
    question: "Inquiry: A scientist finds a rock containing fossilized seashells on a high mountaintop. This evidence primarily supports the idea that:",
    options: ["A. The mountain was formed by volcanic activity.", "B. The rock is extremely young.", "C. The rock layer was once beneath the ocean and uplifted by tectonic forces.", "D. The seashells were transported there by wind."],
    answer: "C",
    category: "Earth and Space"
  },
  {
    question: "Contextual Application: Which imaginary line marks the point north of which the Sun is visible for 24 hours during the summer solstice?",
    options: ["A. Equator.", "B. Prime Meridian.", "C. Tropic of Capricorn.", "D. Arctic Circle."],
    answer: "D",
    category: "Earth and Space"
  }
];

// Earth and Space - Identification Questions
const earthSpaceID = [
  { question: "A geologist studies a thick, layered formation of rock near a river delta. What type of rock is this most likely to be?", answer: "Sedimentary", category: "Earth and Space" },
  { question: "What is the scientific term for the mixture of gases that surrounds the Earth?", answer: "Atmosphere", category: "Earth and Space" },
  { question: "Name the celestial body that orbits a planet and is visible due to reflected light, such as Earth's Moon.", answer: "Satellite", category: "Earth and Space" },
  { question: "What process in the Sun releases the massive amounts of energy that reach Earth as light and heat?", answer: "Nuclear Fusion", category: "Earth and Space" },
  { question: "The force that keeps planets in their orbits around the Sun is called...", answer: "Gravity", category: "Earth and Space" },
  { question: "What is the term for the Earth's continuous motion that causes day and night?", answer: "Rotation", category: "Earth and Space" },
  { question: "Which specific part of the water cycle involves water vapor turning into liquid droplets to form clouds?", answer: "Condensation", category: "Earth and Space" },
  { question: "Identify the outermost layer of the Earth, which is broken into large pieces known as tectonic plates.", answer: "Crust (or Lithosphere)", category: "Earth and Space" },
  { question: "What astronomical event occurs when the Moon passes directly between the Sun and Earth, blocking the Sun's light?", answer: "Solar Eclipse", category: "Earth and Space" },
  { question: "What is the region around a star where the temperature allows liquid water to exist on a planet's surface?", answer: "Habitable Zone (or Goldilocks Zone)", category: "Earth and Space" },
  { question: "An ocean floor feature where two tectonic plates are pulling apart, allowing magma to rise and form new crust.", answer: "Mid-ocean Ridge", category: "Earth and Space" },
  { question: "What is the term for the large, spiral structure, like the Milky Way, composed of billions of stars, gas, and dust?", answer: "Galaxy", category: "Earth and Space" },
  { question: "If you observe that the wind always blows from the sea towards the land during the day near a coast, what type of local wind circulation is this?", answer: "Sea Breeze", category: "Earth and Space" },
  { question: "Name the hottest layer of the Earth's internal structure.", answer: "Inner Core", category: "Earth and Space" },
  { question: "What is the scientific concept that states the same processes (like erosion and deposition) that operate today also operated in the past to shape the Earth?", answer: "Uniformitarianism", category: "Earth and Space" },
  { question: "What is the imaginary line on Earth that separates the Northern Hemisphere from the Southern Hemisphere?", answer: "Equator", category: "Earth and Space" },
  { question: "The process where rocks are physically or chemically broken down into smaller pieces (sediments).", answer: "Weathering", category: "Earth and Space" },
  { question: "What celestial body is known as Earth's \"sister planet\" due to its similar size, though its environment is drastically different?", answer: "Venus", category: "Earth and Space" },
  { question: "What layer of the atmosphere contains the ozone layer, which absorbs most of the Sun's harmful ultraviolet (UV) radiation?", answer: "Stratosphere", category: "Earth and Space" },
  { question: "Name the period of time, approximately 365.25 days, it takes for the Earth to make one complete trip around the Sun.", answer: "Revolution", category: "Earth and Space" },
  { question: "The point in the Earth's orbit where it is closest to the Sun.", answer: "Perihelion", category: "Earth and Space" },
  { question: "What type of resource is coal, petroleum, and natural gas, derived from ancient organic matter?", answer: "Fossil Fuel", category: "Earth and Space" },
  { question: "Which phase of the moon is characterized by the entire face being illuminated, occurring when the Earth is between the Sun and Moon?", answer: "Full Moon", category: "Earth and Space" },
  { question: "A break in the Earth's crust along which movement occurs, often leading to earthquakes.", answer: "Fault", category: "Earth and Space" },
  { question: "The change of rock material from one type (igneous, sedimentary, or metamorphic) to another through geological processes.", answer: "Rock Cycle", category: "Earth and Space" },
  { question: "What is the scientific term for the total black shadow cast during a full eclipse?", answer: "Umbra", category: "Earth and Space" },
  { question: "Which internal layer of the Earth is liquid and is responsible for generating the magnetic field?", answer: "Outer Core", category: "Earth and Space" },
  { question: "The process where soil and rock material are moved from one location to another by wind, water, or ice.", answer: "Erosion", category: "Earth and Space" },
  { question: "What are groups of stars that form a recognizable pattern in the night sky called?", answer: "Constellations", category: "Earth and Space" },
  { question: "Name the gaseous planet known for having a prominent system of rings made mostly of ice particles.", answer: "Saturn", category: "Earth and Space" },
  { question: "The day of the year when the Northern Hemisphere has the shortest period of daylight (longest night).", answer: "Winter Solstice", category: "Earth and Space" },
  { question: "What term is used for the upper part of the mantle, combined with the crust, that forms the rigid outer layer of the Earth?", answer: "Lithosphere", category: "Earth and Space" },
  { question: "What is the primary gas, increasing in concentration due to human activity, that is responsible for enhanced global warming?", answer: "Carbon Dioxide", category: "Earth and Space" },
  { question: "What do we call the phenomenon where ocean water levels are lowest, occurring when the Sun, Earth, and Moon are at a 90° angle?", answer: "Neap Tide", category: "Earth and Space" },
  { question: "What scientific instrument is used to study the light emitted by celestial objects, allowing scientists to determine their composition and temperature?", answer: "Spectroscope", category: "Earth and Space" }
];

// Living Things and Their Environment - Multiple Choice Questions
const livingThingsMC = [
  {
    question: "Scenario: A scientist observes two different pond ecosystems. Pond A has a high diversity of plants and fish. Pond B has only a few types of algae and one type of small insect. Based on these observations, which conclusion is most valid?",
    options: ["A. Pond B has better water quality because it has fewer organisms.", "B. Pond A is more resilient to disease or environmental changes than Pond B.", "C. Pond B is likely a new ecosystem that is still developing.", "D. The water in both ponds is equally suitable for all life forms."],
    answer: "B",
    category: "Living Things and Their Environment"
  },
  {
    question: "Application: Photosynthesis is a process where plants use sunlight to convert carbon dioxide and water into glucose and oxygen. Which part of the plant cell is primarily responsible for carrying out this process?",
    options: ["A. Nucleus.", "B. Mitochondria.", "C. Chloroplasts.", "D. Cell Wall."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Data Analysis: A food web shows that grasshoppers eat grass, frogs eat grasshoppers, and snakes eat frogs. If a local pesticide drastically reduces the frog population, what is the most likely short-term effect on the grasshopper and snake populations?",
    options: ["A. Grasshoppers decrease, Snakes increase.", "B. Grasshoppers increase, Snakes decrease.", "C. Both populations increase.", "D. Both populations decrease."],
    answer: "B",
    category: "Living Things and Their Environment"
  },
  {
    question: "Problem-Solving: A town decides to cut down a large forest to build houses. This action removes the major source of producers in the local ecosystem. What is the most significant long-term impact on the atmosphere in that area?",
    options: ["A. Increased oxygen concentration.", "B. Decreased carbon dioxide concentration.", "C. Increased water vapor and humidity.", "D. Increased carbon dioxide concentration due to less removal by photosynthesis."],
    answer: "D",
    category: "Living Things and Their Environment"
  },
  {
    question: "Evaluation: A student proposes that decomposers are the least important part of a forest ecosystem because they don't produce their own food. Why is this reasoning incorrect?",
    options: ["A. Decomposers are also a food source for primary consumers.", "B. Decomposers are the largest group of organisms in the forest.", "C. Decomposers are essential for recycling nutrients back into the soil for producers.", "D. Decomposers directly control the predator population."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Conceptual Understanding: Which level of biological organization is always comprised of different populations of organisms living and interacting in the same area?",
    options: ["A. Organism.", "B. Population.", "C. Community.", "D. Ecosystem."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Inquiry: A scientist wants to test the effect of temperature on a specific bacterial growth rate. Which of the following should be kept constant (controlled variables) across all experimental groups?",
    options: ["A. The type of bacteria and the amount of growth medium.", "B. The temperature and the type of bacteria.", "C. The growth medium and the final observed growth.", "D. The temperature and the final time of observation."],
    answer: "A",
    category: "Living Things and Their Environment"
  },
  {
    question: "Application: A plant living in a desert environment has small, waxy leaves and a very deep root system. This is an example of an adaptation that helps the plant primarily to:",
    options: ["A. Increase its rate of photosynthesis.", "B. Attract pollinators over long distances.", "C. Conserve water and reach deep water sources.", "D. Defend itself from herbivores."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Synthesis: How does the process of cellular respiration relate to the process of photosynthesis in terms of energy flow?",
    options: ["A. They are completely separate processes with no relationship.", "B. Photosynthesis uses water and releases oxygen; respiration uses oxygen and releases water.", "C. Photosynthesis stores energy from the sun in glucose, and respiration releases that energy from glucose.", "D. Both processes occur only in plant cells and at the same time."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Prediction: If a small, isolated island ecosystem is invaded by a new, non-native predator that has no local natural enemies, what is the most likely long-term outcome for the island's native prey species?",
    options: ["A. The native prey will quickly adapt and evolve defenses.", "B. The native prey population will likely decrease significantly or face extinction.", "C. The predator will only eat the weakest prey, improving the prey's overall health.", "D. The ecosystem's carrying capacity will increase dramatically."],
    answer: "B",
    category: "Living Things and Their Environment"
  },
  {
    question: "Reasoning: Humans breathe faster and deeper during intense exercise. Why is this physiological change necessary?",
    options: ["A. To cool the body down and prevent overheating.", "B. To quickly remove excess nitrogen from the blood.", "C. To supply the muscles with more oxygen for increased cellular respiration and energy production.", "D. To increase the volume of the lungs and improve posture."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Contextual Application: In a city park, all trees are covered in a layer of soot and dirt. This reduces the amount of sunlight that can reach the leaves. What is the direct negative consequence for the trees?",
    options: ["A. Reduced absorption of water from the soil.", "B. Decreased rate of photosynthesis.", "C. Increased loss of water through transpiration.", "D. More vulnerability to strong winds."],
    answer: "B",
    category: "Living Things and Their Environment"
  },
  {
    question: "Interpretation: The relationship between a bee and a flower, where the bee gets nectar (food) and the flower gets pollinated, is an example of which type of ecological relationship?",
    options: ["A. Predation.", "B. Commensalism.", "C. Mutualism.", "D. Parasitism."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Analysis: A population of bacteria is exposed to an antibiotic. Most of the bacteria die, but a few survive and reproduce. This is an example of natural selection. What trait allowed the survivors to pass on their genes?",
    options: ["A. The ability to move quickly.", "B. A pre-existing resistance to the antibiotic.", "C. A change in cell size after antibiotic exposure.", "D. The ability to eat dead bacteria."],
    answer: "B",
    category: "Living Things and Their Environment"
  },
  {
    question: "Creative Thinking: If a new cell organelle were discovered that could convert sound energy directly into chemical energy (food), what biological process would this new organelle most likely replace?",
    options: ["A. Cellular Respiration.", "B. Excretion.", "C. Photosynthesis.", "D. Protein Synthesis."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Conceptual Understanding: Which part of a plant cell is a rigid outer layer that provides support and protection but is generally absent in animal cells?",
    options: ["A. Cell membrane.", "B. Nucleus.", "C. Cell wall.", "D. Vacuole."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Application: A rabbit eats grass, and a fox eats the rabbit. In this food chain, the rabbit is classified as a:",
    options: ["A. Producer.", "B. Primary Consumer.", "C. Secondary Consumer.", "D. Decomposer."],
    answer: "B",
    category: "Living Things and Their Environment"
  },
  {
    question: "Analysis: When using a microscope, if you move the slide to the left, which direction does the image appear to move in the field of view?",
    options: ["A. Left.", "B. Down.", "C. Right.", "D. Up."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Problem-Solving: A plant is watered with only salt water. Over time, the plant wilts and dies. This is primarily because of which process, causing water to leave the plant's cells?",
    options: ["A. Active transport.", "B. Facilitated diffusion.", "C. Osmosis.", "D. Photosynthesis."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Evaluation: In an experiment to test the effect of fertilizer on plant growth, the control group should be:",
    options: ["A. The plant given the most fertilizer.", "B. The plant given less water.", "C. The plant given no fertilizer.", "D. The plant placed in the dark."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Contextual Application: In the food pyramid, why do energy levels decrease dramatically (by approximately 90%) at each successive trophic level?",
    options: ["A. Consumers eat less food than producers make.", "B. Most energy is lost as heat during metabolic processes.", "C. The size of the organisms increases.", "D. The population size gets larger."],
    answer: "B",
    category: "Living Things and Their Environment"
  },
  {
    question: "Interpretation: A doctor observes a small, non-photosynthetic organism that is essential for breaking down organic matter. This organism is most likely a type of:",
    options: ["A. Protist.", "B. Bacteria.", "C. Fungus.", "D. Plant."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Synthesis: How do the circulatory and respiratory systems work together to support cellular respiration in the body?",
    options: ["A. The circulatory system filters the blood, and the respiratory system provides the energy.", "B. The respiratory system pumps blood, and the circulatory system absorbs oxygen.", "C. The respiratory system takes in oxygen, and the circulatory system transports it (and glucose) to the cells.", "D. Both systems primarily function to maintain water balance."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Reasoning: Which statement best explains why a virus is generally considered non-living by most scientists?",
    options: ["A. It is too small to be seen by the naked eye.", "B. It cannot move on its own.", "C. It cannot reproduce or carry out metabolic processes without invading a host cell.", "D. It is made only of genetic material and protein."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Inquiry: A scientist uses the objective lens marked 40X and the eyepiece lens marked 10X. What is the total magnification of the image?",
    options: ["A. 4X.", "B. 50X.", "C. 400X.", "D. 4000X."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Conceptual Understanding: Which part of the cell is referred to as the \"brain\" or control center because it contains the DNA and directs the cell's activities?",
    options: ["A. Cell membrane.", "B. Mitochondrion.", "C. Chloroplast.", "D. Nucleus."],
    answer: "D",
    category: "Living Things and Their Environment"
  },
  {
    question: "Application: An organism that benefits while harming its host (e.g., a tick feeding on a dog) demonstrates which ecological relationship?",
    options: ["A. Mutualism.", "B. Commensalism.", "C. Competition.", "D. Parasitism."],
    answer: "D",
    category: "Living Things and Their Environment"
  },
  {
    question: "Analysis: A sudden decrease in the population of primary producers in an ecosystem will most immediately lead to a decline in the population of which group?",
    options: ["A. Decomposers.", "B. Producers.", "C. Primary Consumers.", "D. Tertiary Consumers."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Prediction: If a human body is unable to regulate its internal temperature and it rises too high, what physiological process is most directly failing?",
    options: ["A. Cellular respiration.", "B. Reproduction.", "C. Homeostasis.", "D. Photosynthesis."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Creative Thinking: If a new animal species was discovered that primarily ate decomposers, what would its trophic level classification be?",
    options: ["A. Producer.", "B. Primary Consumer.", "C. Secondary Consumer.", "D. Impossible to classify (or Detritivore)."],
    answer: "D",
    category: "Living Things and Their Environment"
  },
  {
    question: "Reasoning: Why do plant cells have large, central vacuoles while animal cells generally have small or no vacuoles?",
    options: ["A. Vacuoles store enzymes in animal cells.", "B. The large vacuole in plants helps maintain turgor pressure and store water/nutrients.", "C. Plant cells need vacuoles for photosynthesis.", "D. Animal cells use the vacuole for reproduction."],
    answer: "B",
    category: "Living Things and Their Environment"
  },
  {
    question: "Interpretation: The phrase \"a group of organisms of the same species living together in a specific area\" is the definition of a:",
    options: ["A. Community.", "B. Ecosystem.", "C. Population.", "D. Biosphere."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Synthesis: What is the common end product that is released by both plant cells (during cellular respiration) and animal cells (during exercise)?",
    options: ["A. Glucose.", "B. Oxygen.", "C. Carbon Dioxide (CO2).", "D. Chlorophyll."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Inquiry: A student hypothesizes that green light is the least effective color for plant growth. To test this, what color light should be used on the experimental group to support the hypothesis?",
    options: ["A. Red light.", "B. Blue light.", "C. Green light.", "D. White light (control)."],
    answer: "C",
    category: "Living Things and Their Environment"
  },
  {
    question: "Contextual Application: Which type of microbe is responsible for causing the flu or common cold?",
    options: ["A. Bacteria.", "B. Fungus.", "C. Protist.", "D. Virus."],
    answer: "D",
    category: "Living Things and Their Environment"
  }
];

// Living Things and Their Environment - Identification Questions
const livingThingsID = [
  { question: "What term is used for an organism that breaks down dead organic matter and returns nutrients to the soil?", answer: "Decomposer", category: "Living Things and Their Environment" },
  { question: "Name the single, coiled molecule found in the nucleus of a cell that carries the genetic instructions for an organism.", answer: "DNA", category: "Living Things and Their Environment" },
  { question: "What is the total mass of living matter in a specific area or ecosystem called?", answer: "Biomass", category: "Living Things and Their Environment" },
  { question: "Which specific organelle in animal cells is responsible for generating most of the cell's energy (ATP)?", answer: "Mitochondrion", category: "Living Things and Their Environment" },
  { question: "The place where an organism lives, including all the biotic and abiotic factors, is called its...", answer: "Habitat", category: "Living Things and Their Environment" },
  { question: "What are the specialized structures in the cell membrane that regulate what enters and leaves the cell?", answer: "Transport Proteins", category: "Living Things and Their Environment" },
  { question: "Name the process where an organism maintains a stable internal environment despite external changes.", answer: "Homeostasis", category: "Living Things and Their Environment" },
  { question: "What is the name of the reproductive process that involves two parents and results in genetically diverse offspring?", answer: "Sexual Reproduction", category: "Living Things and Their Environment" },
  { question: "What is a disease-causing agent, such as a bacteria or virus, called?", answer: "Pathogen", category: "Living Things and Their Environment" },
  { question: "The maximum population size of a species that an environment can sustain indefinitely, given the available resources.", answer: "Carrying Capacity", category: "Living Things and Their Environment" },
  { question: "What term describes the variety of life in a particular habitat or ecosystem?", answer: "Biodiversity", category: "Living Things and Their Environment" },
  { question: "Identify the simple sugar that is the primary product of photosynthesis and the main source of energy for the plant.", answer: "Glucose", category: "Living Things and Their Environment" },
  { question: "What is the movement of water from an area of high concentration to an area of low concentration across a semi-permeable membrane?", answer: "Osmosis", category: "Living Things and Their Environment" },
  { question: "The biological process of grouping and naming organisms based on shared characteristics.", answer: "Classification", category: "Living Things and Their Environment" },
  { question: "Which specific tissue in a plant is responsible for transporting water and dissolved minerals from the roots up to the leaves?", answer: "Xylem", category: "Living Things and Their Environment" },
  { question: "What is the name of the process that plants use to release excess water vapor into the atmosphere?", answer: "Transpiration", category: "Living Things and Their Environment" },
  { question: "Which cell structure controls the movement of substances into and out of all cells?", answer: "Cell Membrane", category: "Living Things and Their Environment" },
  { question: "What are organisms that make their own food, usually through photosynthesis, called?", answer: "Producers", category: "Living Things and Their Environment" },
  { question: "Name the tube-like plant tissue responsible for transporting manufactured food (sugar) from the leaves to other parts of the plant.", answer: "Phloem", category: "Living Things and Their Environment" },
  { question: "The long-term change in the characteristics of a population over successive generations due to natural selection.", answer: "Evolution", category: "Living Things and Their Environment" },
  { question: "What are the openings, usually on the underside of leaves, that allow for gas exchange (CO2 in, O2 out)?", answer: "Stomata", category: "Living Things and Their Environment" },
  { question: "Name the relationship where one organism benefits and the other is neither helped nor harmed.", answer: "Commensalism", category: "Living Things and Their Environment" },
  { question: "What term describes a physical feature or behavior that allows an organism to survive and reproduce in its environment?", answer: "Adaptation", category: "Living Things and Their Environment" },
  { question: "Which specific part of the microscope do you look through (and usually has a 10X magnification)?", answer: "Eyepiece", category: "Living Things and Their Environment" },
  { question: "The process where a cell divides to produce two genetically identical daughter cells.", answer: "Mitosis", category: "Living Things and Their Environment" },
  { question: "What are the non-living chemical and physical factors in an environment (e.g., water, air, soil)?", answer: "Abiotic Factors", category: "Living Things and Their Environment" },
  { question: "What is the general term for an organism that consumes (eats) other organisms for energy?", answer: "Consumer", category: "Living Things and Their Environment" },
  { question: "The relationship between two species that require the same limited resource in an ecosystem.", answer: "Competition", category: "Living Things and Their Environment" },
  { question: "Name the type of cell (like bacterial cells) that lacks a true nucleus and membrane-bound organelles.", answer: "Prokaryotic", category: "Living Things and Their Environment" },
  { question: "The specific role or job of an organism in its community, including its physical requirements and interactions.", answer: "Niche", category: "Living Things and Their Environment" },
  { question: "What element is absorbed by plants during photosynthesis and released by animals during respiration?", answer: "Oxygen", category: "Living Things and Their Environment" },
  { question: "What term is used for the smallest functional and structural unit of all known living things?", answer: "Cell", category: "Living Things and Their Environment" },
  { question: "Which human body system is primarily responsible for breaking down food into nutrients for absorption?", answer: "Digestive System", category: "Living Things and Their Environment" },
  { question: "The process of breeding plants or animals for desired traits by choosing the parents is called...", answer: "Artificial Selection", category: "Living Things and Their Environment" },
  { question: "The interconnected and overlapping feeding relationships in an ecosystem is known as a...", answer: "Food Web", category: "Living Things and Their Environment" }
];

// Matter - Multiple Choice Questions
const matterMC = [
  {
    question: "Scenario: A chef heats a pot of water on a stove. The water eventually boils and turns into steam. Which statement best describes the change at the particle level?",
    options: ["A. The water particles themselves change their chemical structure.", "B. The particles gain energy and move faster and farther apart, overcoming the attractive forces.", "C. New chemical bonds form between the water particles to create a gas.", "D. The particles are destroyed and new gas particles are created."],
    answer: "B",
    category: "Matter"
  },
  {
    question: "Application: A student mixes sand and salt in a beaker of water. The salt dissolves, but the sand does not. Which separation technique would be most effective for initially separating the dissolved salt solution from the undissolved sand?",
    options: ["A. Distillation.", "B. Evaporation.", "C. Filtration.", "D. Chromatography."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Data Analysis: Two pure substances, X and Y, are heated. Substance X melts at 80°C and boils at 300°C. Substance Y melts at 15°C and boils at 85°C. At a room temperature of 25°C, what are the states of matter for X and Y?",
    options: ["A. X is solid, Y is gas.", "B. X is liquid, Y is gas.", "C. X is solid, Y is liquid.", "D. X is gas, Y is liquid."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Problem-Solving: A chemical reaction occurs in a sealed container, producing a gas. If the total mass of the reactants was 50 grams, what must the total mass of the products (including the gas) be, according to the Law of Conservation of Mass?",
    options: ["A. Less than 50 grams.", "B. More than 50 grams.", "C. Exactly 50 grams.", "D. Impossible to determine without knowing the volume."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Evaluation: A sign in a laboratory warns: \"Flammable Liquid.\" This warning refers to which specific property of the substance?",
    options: ["A. Physical property (boiling point).", "B. Chemical property (reactivity with oxygen/fire).", "C. Intensive property (density).", "D. Extensive property (volume)."],
    answer: "B",
    category: "Matter"
  },
  {
    question: "Conceptual Understanding: Which of the following examples represents a chemical change?",
    options: ["A. Water freezing into ice.", "B. Sugar dissolving in tea.", "C. An iron nail rusting over time.", "D. Crumpling a piece of aluminum foil."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Inquiry: A scientist wants to determine if an unknown liquid is a pure substance or a mixture. Which experimental procedure would provide the strongest evidence?",
    options: ["A. Observing its color and odor.", "B. Measuring its density at different temperatures.", "C. Measuring its boiling point to see if it remains constant as it boils.", "D. Observing whether it mixes with water."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Application: Saltwater is a solution, which is a specific type of mixture. What term is used for the substance that is dissolved in the solvent (water)?",
    options: ["A. Precipitate.", "B. Solute.", "C. Compound.", "D. Suspension."],
    answer: "B",
    category: "Matter"
  },
  {
    question: "Synthesis: Which statement correctly compares the density of an object to its buoyancy in water?",
    options: ["A. Objects with low density always sink in water.", "B. An object less dense than water will float.", "C. Density and buoyancy are unrelated properties.", "D. All objects denser than water will float, provided they are small enough."],
    answer: "B",
    category: "Matter"
  },
  {
    question: "Prediction: If the pressure exerted on a container of gas is significantly increased while the temperature is kept constant, what change in the gas particles' behavior would you predict?",
    options: ["A. The particles' mass would decrease.", "B. The distance between the particles would decrease.", "C. The particles' kinetic energy would increase.", "D. The particles would turn into a liquid."],
    answer: "B",
    category: "Matter"
  },
  {
    question: "Reasoning: A gold ring has a density of 19.3 g/cm³. A much larger gold ingot also has a density of 19.3 g/cm³. Why are their densities the same despite their different masses and volumes?",
    options: ["A. Density is an extensive property that depends on the amount of substance.", "B. Both objects contain the same total number of particles.", "C. The force of gravity on both objects is the same.", "D. Density is an intensive property that does not depend on the amount of substance."],
    answer: "D",
    category: "Matter"
  },
  {
    question: "Contextual Application: When you boil water for pasta, the heating element at the bottom of the pot heats the water closest to it, which then rises, allowing cooler water to move down. What mode of heat transfer is dominating the heating of the bulk water?",
    options: ["A. Conduction.", "B. Radiation.", "C. Convection.", "D. Evaporation."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Interpretation: The chemical formula for water is H₂O. This formula represents a pure substance that is a(n):",
    options: ["A. Element.", "B. Compound.", "C. Homogeneous Mixture.", "D. Heterogeneous Mixture."],
    answer: "B",
    category: "Matter"
  },
  {
    question: "Analysis: A scientist is comparing an element to a compound. What is the most fundamental difference between them?",
    options: ["A. An element is always solid, while a compound is always liquid.", "B. A compound can be broken down into simpler substances (elements) by chemical means, but an element cannot.", "C. A compound has only one type of atom, while an element has two or more.", "D. Elements are always metals, and compounds are always non-metals."],
    answer: "B",
    category: "Matter"
  },
  {
    question: "Creative Thinking: A new state of matter is proposed where particles are extremely rigid and completely stop moving. If this state were to exist, what would be its defining physical property regarding volume and shape?",
    options: ["A. Indefinite volume and indefinite shape.", "B. Indefinite volume and definite shape.", "C. Definite volume and indefinite shape.", "D. Definite volume and definite shape (like a super-solid)."],
    answer: "D",
    category: "Matter"
  },
  {
    question: "Conceptual Understanding: Which of the following describes a substance in the plasma state of matter?",
    options: ["A. Low energy particles held in a fixed lattice.", "B. High energy particles that are far apart.", "C. Extremely high energy, ionized gas particles.", "D. Particles with a definite volume but no definite shape."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Application: Distillation is a separation technique used to separate which type of mixture?",
    options: ["A. Two immiscible solids.", "B. An insoluble solid from a liquid.", "C. A soluble solid from a liquid (or two miscible liquids with different boiling points).", "D. Magnetic materials from non-magnetic materials."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Analysis: When a liquid is heated, its volume generally increases slightly. This thermal expansion is explained by the particles:",
    options: ["A. Changing their chemical formula.", "B. Moving faster and taking up slightly more space.", "C. Losing mass.", "D. Changing from liquid to solid."],
    answer: "B",
    category: "Matter"
  },
  {
    question: "Problem-Solving: If 10 grams of sugar is completely dissolved in 100 ml of water, what is the final volume of the solution?",
    options: ["A. Exactly 110 ml.", "B. Less than 100 ml.", "C. Slightly less than 110 ml (because sugar fills the voids).", "D. More than 110 ml."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Evaluation: Why is density considered an intensive property of matter?",
    options: ["A. Because it has a fixed value for all substances.", "B. Because it is calculated using mass and volume.", "C. Because it does not change with the amount of substance present.", "D. Because it only applies to liquids."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Contextual Application: You notice small droplets forming on the outside of a cold glass of soda on a hot day. This is an example of:",
    options: ["A. Evaporation.", "B. Sublimation.", "C. Condensation.", "D. Freezing."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Interpretation: What is the difference between a homogeneous mixture and a compound?",
    options: ["A. A compound can be separated physically; a mixture cannot.", "B. A mixture has uniform properties; a compound does not.", "C. A compound has chemically bonded components; a homogeneous mixture is physically combined.", "D. Both are pure substances."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Synthesis: How does the increase in kinetic energy of particles relate to the process of melting?",
    options: ["A. Increased kinetic energy forces new chemical bonds to form.", "B. Increased kinetic energy causes the particles to slow down and become fixed.", "C. Increased kinetic energy allows particles to overcome intermolecular forces and move freely.", "D. Increased kinetic energy decreases the temperature."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Reasoning: When wood burns, it appears to lose mass (turns to ash and smoke). Why does this phenomenon not violate the Law of Conservation of Mass?",
    options: ["A. Because the heat energy accounts for the lost mass.", "B. The mass of the gases and ash produced is equal to the original mass of the wood plus the oxygen used.", "C. The law only applies to liquids and solids.", "D. Burning is a physical change."],
    answer: "B",
    category: "Matter"
  },
  {
    question: "Inquiry: A student wants to compare the solubility of salt and sugar in water at 20°C. Which variable should they change in their experiment?",
    options: ["A. The volume of water.", "B. The temperature of the water.", "C. The mass of salt versus the mass of sugar added.", "D. The time allowed for stirring."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Conceptual Understanding: The particle within the atom that has a neutral charge is the:",
    options: ["A. Electron.", "B. Proton.", "C. Neutron.", "D. Nucleus."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Application: A substance that turns purple in the presence of an iodine solution is known to contain:",
    options: ["A. Protein.", "B. Sugar.", "C. Starch.", "D. Water."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Analysis: Which of the following separation methods is primarily based on the difference in particle size?",
    options: ["A. Distillation.", "B. Evaporation.", "C. Filtration.", "D. Magnetism."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Prediction: If a gas is compressed into a small container at a very high pressure, the particles will:",
    options: ["A. Stop moving completely.", "B. Increase their kinetic energy.", "C. Experience stronger intermolecular attractions and potentially liquefy.", "D. Break down into different elements."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Creative Thinking: If a scientist wants to make a liquid less viscous (flow more easily), they should generally:",
    options: ["A. Decrease the temperature.", "B. Increase the temperature.", "C. Increase the pressure.", "D. Mix it with an insoluble solid."],
    answer: "B",
    category: "Matter"
  },
  {
    question: "Reasoning: Why does the smell of perfume spread quickly across a room?",
    options: ["A. The particles react chemically with the air.", "B. The perfume particles are carried by air currents only.", "C. The random, constant motion of the gas particles (diffusion) carries the scent.", "D. The perfume is less dense than the air."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Interpretation: A substance is described as having a fixed, unchangeable chemical composition. This means the substance must be a:",
    options: ["A. Homogeneous mixture.", "B. Heterogeneous mixture.", "C. Pure substance (Element or Compound).", "D. Solution."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Synthesis: The change from liquid water to solid ice is an example of a:",
    options: ["A. Chemical change that releases energy.", "B. Chemical change that absorbs energy.", "C. Physical change that releases energy (exothermic).", "D. Physical change that absorbs energy (endothermic)."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Inquiry: The specific temperature at which a liquid changes to a gas is called its:",
    options: ["A. Melting point.", "B. Freezing point.", "C. Boiling point.", "D. Sublimation point."],
    answer: "C",
    category: "Matter"
  },
  {
    question: "Contextual Application: What is the primary method of heat transfer when you feel the warmth of a bonfire or a heat lamp?",
    options: ["A. Conduction.", "B. Convection.", "C. Radiation.", "D. Vaporization."],
    answer: "C",
    category: "Matter"
  }
];

// Matter - Identification Questions
const matterID = [
  { question: "What is the fundamental building block of matter that cannot be broken down into simpler substances by ordinary chemical means?", answer: "Element", category: "Matter" },
  { question: "Name the state of matter characterized by a definite volume but an indefinite shape.", answer: "Liquid", category: "Matter" },
  { question: "What term is used for a property of matter that can be observed or measured without changing the substance's chemical composition (e.g., color, density)?", answer: "Physical Property", category: "Matter" },
  { question: "What is the total energy of motion of the particles in a substance called?", answer: "Thermal Energy", category: "Matter" },
  { question: "The mass of an object divided by its volume gives you this measurable property.", answer: "Density", category: "Matter" },
  { question: "What is a pure substance composed of two or more different elements chemically combined in a fixed ratio?", answer: "Compound", category: "Matter" },
  { question: "Name the separation technique used to separate a soluble solid from a liquid by turning the liquid into a gas.", answer: "Evaporation", category: "Matter" },
  { question: "What is the term for a mixture whose components are visibly distinguishable (e.g., sand and water)?", answer: "Heterogeneous Mixture", category: "Matter" },
  { question: "What happens to the internal energy of a substance during an exothermic chemical reaction?", answer: "Released", category: "Matter" },
  { question: "What particle in an atom determines its atomic number and chemical identity?", answer: "Proton", category: "Matter" },
  { question: "The process where a solid changes directly into a gas without passing through the liquid phase.", answer: "Sublimation", category: "Matter" },
  { question: "The scientific law that states mass is neither created nor destroyed during a chemical reaction.", answer: "Law of Conservation of Mass", category: "Matter" },
  { question: "What is the measure of the average kinetic energy of the particles in a substance?", answer: "Temperature", category: "Matter" },
  { question: "Name the process where a solid substance dissolves in a liquid to form a solution.", answer: "Dissolving", category: "Matter" },
  { question: "What is the smallest unit of an element that retains the chemical properties of that element?", answer: "Atom", category: "Matter" },
  { question: "What is the term for the component of a solution that is present in the largest amount (e.g., water in salt water)?", answer: "Solvent", category: "Matter" },
  { question: "The specific temperature at which a solid changes into a liquid.", answer: "Melting Point", category: "Matter" },
  { question: "What is a property of matter that describes how easily a substance reacts chemically with other substances?", answer: "Reactivity", category: "Matter" },
  { question: "Name the subatomic particle with a negative charge.", answer: "Electron", category: "Matter" },
  { question: "The change of state from a gas to a liquid.", answer: "Condensation", category: "Matter" },
  { question: "What is the term for a mixture that has uniform composition throughout (e.g., air or sugar water)?", answer: "Homogeneous Mixture", category: "Matter" },
  { question: "A solid that forms and separates from a liquid solution during a chemical reaction.", answer: "Precipitate", category: "Matter" },
  { question: "Name the force of attraction that holds two or more atoms together in a compound.", answer: "Chemical Bond", category: "Matter" },
  { question: "What do we call a material that allows heat or electricity to pass through it easily?", answer: "Conductor", category: "Matter" },
  { question: "The amount of space an object occupies.", answer: "Volume", category: "Matter" },
  { question: "What is the term for the mode of heat transfer that occurs mainly in solids due to particle-to-particle contact?", answer: "Conduction", category: "Matter" },
  { question: "The ability of a solid to be hammered or pressed into thin sheets without breaking.", answer: "Malleability", category: "Matter" },
  { question: "What is the scientific concept that states matter is made up of tiny particles that are always in motion?", answer: "Kinetic Molecular Theory", category: "Matter" },
  { question: "Name the process where a liquid changes directly into a solid.", answer: "Freezing", category: "Matter" },
  { question: "A chemical reaction that absorbs energy from its surroundings.", answer: "Endothermic", category: "Matter" },
  { question: "What are the columns on the periodic table of elements called?", answer: "Groups", category: "Matter" },
  { question: "What term is used for the smallest particle of a compound that retains the chemical properties of that compound?", answer: "Molecule", category: "Matter" },
  { question: "The property of a liquid that describes its resistance to flow.", answer: "Viscosity", category: "Matter" },
  { question: "What is the specific name for the forces of attraction between particles of the same substance?", answer: "Cohesive Forces", category: "Matter" },
  { question: "The ability of a substance to dissolve in a solvent.", answer: "Solubility", category: "Matter" }
];

// Force, Motion, and Energy - Multiple Choice Questions
const forceMotionEnergyMC = [
  {
    question: "Scenario: A car travels a distance of 120 km in 2 hours. What is the car's average speed?",
    options: ["A. 60 m/s.", "B. 240 km/h.", "C. 60 km/h.", "D. 120 km/h."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Application: A student pushes a box across a rough floor. The student notices that once the box is moving, a smaller force is needed to keep it moving at a constant speed than was needed to start it moving. What force is the student overcoming when they first try to move the box?",
    options: ["A. Air Resistance.", "B. Gravitational Force.", "C. Static Friction.", "D. Kinetic Energy."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Data Analysis: A motion graph plots Velocity (y-axis) vs. Time (x-axis). A horizontal, straight line is observed from t=2 s to t=5 s. What does this segment of the graph indicate about the object's motion?",
    options: ["A. The object is at rest.", "B. The object is slowing down.", "C. The object is moving at a constant velocity (zero acceleration).", "D. The object is accelerating at a constant rate."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Problem-Solving: A roller coaster car is pulled to the top of the first and highest hill. At this peak, its energy is primarily in which form?",
    options: ["A. Kinetic Energy.", "B. Gravitational Potential Energy.", "C. Thermal Energy.", "D. Chemical Energy."],
    answer: "B",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Evaluation: Two students observe a falling object. Student A says the object accelerates because of gravity. Student B says the object accelerates because there is an unbalanced force acting on it. Whose explanation is more complete and why?",
    options: ["A. Student A, because gravity is the only factor affecting acceleration.", "B. Student B, because acceleration is defined as the result of a net (unbalanced) force.", "C. Both are equally complete, as gravity and unbalanced force are the same thing.", "D. Neither, as acceleration is determined by the object's mass only."],
    answer: "B",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Conceptual Understanding: According to Newton's First Law of Motion (Inertia), what will happen to an object already moving at a constant velocity if the net force acting on it is zero?",
    options: ["A. It will gradually slow down and stop.", "B. It will continue to move at the same velocity (constant speed and direction).", "C. It will accelerate exponentially.", "D. It will move in a circular path."],
    answer: "B",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Inquiry: A team wants to investigate which surface creates the most friction for a wooden block. They pull the block across four different surfaces (wood, sand, ice, carpet). Which factor must be kept constant (controlled variable) for a valid experiment?",
    options: ["A. The force applied to the block.", "B. The mass of the wooden block.", "C. The distance the block travels.", "D. The time it takes for the block to stop."],
    answer: "B",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Application: A person jumps off a skateboard and the skateboard rolls backward. Which of Newton's Laws of Motion best explains the skateboard's backward motion?",
    options: ["A. First Law (Inertia).", "B. Third Law (Action-Reaction).", "C. Law of Universal Gravitation.", "D. Law of Conservation of Energy."],
    answer: "B",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Synthesis: A battery converts stored chemical energy into electrical energy. When this electrical energy is used to power a fan, which sequence of energy transformations is most likely occurring?",
    options: ["A. Electrical → Sound → Heat.", "B. Electrical → Heat → Kinetic.", "C. Electrical → Kinetic → Sound and Heat.", "D. Chemical → Heat → Light."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Prediction: A spaceship travels to a distant galaxy where the gravitational force is much stronger than on Earth. If an astronaut on the ship throws a ball horizontally, how will the ball's trajectory (path) differ from the same throw on Earth?",
    options: ["A. It will travel farther horizontally.", "B. It will curve downward much more sharply.", "C. It will curve upward more sharply.", "D. It will follow a perfectly straight line."],
    answer: "B",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Reasoning: In a circuit, a 10 Ohm resistor and a 20 Ohm resistor are connected in series. Why is the total resistance of this combination 30 Ohms?",
    options: ["A. The voltage splits evenly between the two resistors.", "B. The electrons travel through both resistors sequentially, so their individual resistances add up.", "C. The current increases as it passes through the two resistors.", "D. Only the larger resistor contributes to the total resistance."],
    answer: "B",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Contextual Application: A solar panel converts sunlight directly into electricity. What type of energy transformation is this?",
    options: ["A. Chemical Energy to Thermal Energy.", "B. Mechanical Energy to Electrical Energy.", "C. Light Energy (Radiant) to Electrical Energy.", "D. Nuclear Energy to Light Energy."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Interpretation: In the formula W = Force × Distance, the term 'W' represents which concept?",
    options: ["A. Power.", "B. Momentum.", "C. Work.", "D. Acceleration."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Analysis: A car accelerates from 0 m/s to 10 m/s in 5 seconds. A second car accelerates from 10 m/s to 20 m/s in 5 seconds. Assuming both cars have the same mass, which car had the greater acceleration?",
    options: ["A. The first car.", "B. The second car.", "C. Both cars had the same acceleration (2 m/s²).", "D. The car with the greater final velocity."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Creative Thinking: If a new technology allowed you to completely eliminate air resistance, how would a falling feather's motion compare to a falling bowling ball's motion?",
    options: ["A. The feather would fall slower because it has less mass.", "B. The bowling ball would fall faster because it is denser.", "C. They would both fall at the same acceleration (9.8 m/s²) and hit the ground at the same time.", "D. They would both float indefinitely."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Conceptual Understanding: An object's mass is 2 kg. If a net force of 10 N is applied to it, what is its acceleration?",
    options: ["A. 0.2 m/s².", "B. 5 N/kg.", "C. 5 m/s².", "D. 20 m/s²."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Application: Which of the following is the best example of a machine increasing the distance over which a force is applied?",
    options: ["A. Using a lever to lift a heavy rock.", "B. Using a ramp (inclined plane) to push a box to a higher level.", "C. Using a single pulley to change the direction of a force.", "D. Using a wheel and axle to turn a steering wheel."],
    answer: "B",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Analysis: A graph plots Distance (y-axis) vs. Time (x-axis). A straight line sloping upward indicates:",
    options: ["A. Constant acceleration.", "B. Constant speed.", "C. The object is at rest.", "D. Increasing acceleration."],
    answer: "B",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Problem-Solving: If a student does 20 Joules of work to lift a book 1 meter, what force did the student apply (neglecting friction)?",
    options: ["A. 1 N.", "B. 2 N.", "C. 20 N.", "D. 20 J."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Evaluation: A perpetual motion machine claims to run forever without any external energy source. Why does this claim violate the Law of Conservation of Energy?",
    options: ["A. It produces more energy than it consumes.", "B. It fails to account for potential energy.", "C. It ignores energy loss due to unavoidable forces like friction and air resistance.", "D. It converts kinetic energy directly to potential energy."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Contextual Application: You rub your hands together quickly on a cold day to warm them up. This demonstrates the conversion of which type of energy into thermal (heat) energy?",
    options: ["A. Chemical energy.", "B. Mechanical (Kinetic) energy.", "C. Light energy.", "D. Electrical energy."],
    answer: "B",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Interpretation: The fact that the gravitational force between two objects depends on the square of the distance between them means that if the distance is doubled, the force:",
    options: ["A. Halves.", "B. Stays the same.", "C. Quarters (1/4 of the original).", "D. Quadruples."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Synthesis: In a parallel circuit, why do the lights remain on if one bulb burns out?",
    options: ["A. The total current is reduced.", "B. The total voltage increases.", "C. The current has multiple paths, so the flow to other components is maintained.", "D. The burned-out bulb acts as a switch."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Reasoning: Why does a hockey puck sliding on ice eventually stop, even though it may start with a high velocity?",
    options: ["A. The puck runs out of inertia.", "B. Its potential energy converts to kinetic energy.", "C. It is acted upon by an unbalanced force (kinetic friction) that opposes its motion.", "D. The mass of the puck increases as it slides."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Inquiry: Which of the following quantities is a vector (requires both magnitude and direction)?",
    options: ["A. Speed.", "B. Distance.", "C. Mass.", "D. Velocity."],
    answer: "D",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Conceptual Understanding: What is the term for the maximum displacement of a wave from its rest position?",
    options: ["A. Wavelength.", "B. Frequency.", "C. Amplitude.", "D. Crest."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Application: Which simple machine is essentially a rotating inclined plane used to hold two things together?",
    options: ["A. Lever.", "B. Wedge.", "C. Screw.", "D. Pulley."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Analysis: In a tug-of-war where both teams pull with 500 N of force in opposite directions, what is the net force acting on the rope?",
    options: ["A. 1000 N.", "B. 500 N.", "C. 0 N.", "D. -500 N."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Prediction: If the current through a simple circuit is doubled, assuming the resistance remains constant, what must happen to the voltage?",
    options: ["A. It is halved.", "B. It is quartered.", "C. It is doubled.", "D. It remains the same."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Creative Thinking: If a new material was discovered that had perfect zero friction, how would a spinning top behave on a flat surface made of this material?",
    options: ["A. It would stop instantly.", "B. It would slow down very quickly.", "C. It would spin forever until an external force acted on it.", "D. It would fly off the surface due to inertia."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Reasoning: Why is the force of gravity much less noticeable in everyday life than the electromagnetic force?",
    options: ["A. Gravity only affects objects with very large masses (like planets).", "B. The gravitational force is significantly weaker than the electromagnetic force at short distances.", "C. The electromagnetic force is always repulsive.", "D. The two forces only interact in the nucleus of an atom."],
    answer: "B",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Interpretation: What does the slope of a velocity vs. time graph represent?",
    options: ["A. Distance.", "B. Speed.", "C. Acceleration.", "D. Force."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Synthesis: How do wind turbines convert kinetic energy from the air into electrical energy?",
    options: ["A. The wind produces static electricity that is collected.", "B. The kinetic energy heats water to produce steam for a generator.", "C. The kinetic energy turns the turbine blades, which drive a generator.", "D. The wind's potential energy is stored in the blades."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Inquiry: To calculate the power output of a machine, you need to measure the work done and the:",
    options: ["A. Force applied.", "B. Distance traveled.", "C. Time taken.", "D. Mass of the load."],
    answer: "C",
    category: "Force, Motion, and Energy"
  },
  {
    question: "Contextual Application: Which energy transformation occurs when you strike a match?",
    options: ["A. Electrical to Thermal.", "B. Kinetic to Light.", "C. Chemical to Thermal and Light.", "D. Nuclear to Chemical."],
    answer: "C",
    category: "Force, Motion, and Energy"
  }
];

// Force, Motion, and Energy - Identification Questions
const forceMotionEnergyID = [
  { question: "What is the rate of change of an object's velocity?", answer: "Acceleration", category: "Force, Motion, and Energy" },
  { question: "Name the energy possessed by an object due to its motion.", answer: "Kinetic Energy", category: "Force, Motion, and Energy" },
  { question: "The scientific unit for force is the...", answer: "Newton (or N)", category: "Force, Motion, and Energy" },
  { question: "What is the measure of the resistance of an object to a change in its state of motion?", answer: "Inertia (or Mass)", category: "Force, Motion, and Energy" },
  { question: "What term describes the total distance an object travels divided by the total time taken?", answer: "Average Speed", category: "Force, Motion, and Energy" },
  { question: "What kind of force is required to change an object's state of motion?", answer: "Unbalanced Force", category: "Force, Motion, and Energy" },
  { question: "Name the transfer of heat through the movement of fluids (liquids or gases).", answer: "Convection", category: "Force, Motion, and Energy" },
  { question: "What is the scientific term for the total displacement of an object divided by the time interval?", answer: "Average Velocity", category: "Force, Motion, and Energy" },
  { question: "What is the transfer of energy through empty space via electromagnetic waves?", answer: "Radiation", category: "Force, Motion, and Energy" },
  { question: "What type of electrical circuit provides only one path for the electric current to flow?", answer: "Series Circuit", category: "Force, Motion, and Energy" },
  { question: "Name the property of a circuit that opposes the flow of electric current.", answer: "Resistance", category: "Force, Motion, and Energy" },
  { question: "What type of energy is stored in the bonds of chemical compounds (e.g., in a battery or fuel)?", answer: "Chemical Energy", category: "Force, Motion, and Energy" },
  { question: "What is the product of an object's mass and its velocity?", answer: "Momentum", category: "Force, Motion, and Energy" },
  { question: "Name the point used for reference to determine if an object is in motion.", answer: "Reference Point", category: "Force, Motion, and Energy" },
  { question: "A push or a pull that has both magnitude and direction is known as a...", answer: "Vector", category: "Force, Motion, and Energy" },
  { question: "What is the scientific unit for electrical energy?", answer: "Joule", category: "Force, Motion, and Energy" },
  { question: "Name the stored energy of an object due to its position or condition (e.g., height).", answer: "Potential Energy", category: "Force, Motion, and Energy" },
  { question: "What term is used for the force that opposes motion between two surfaces that are touching?", answer: "Friction", category: "Force, Motion, and Energy" },
  { question: "Which law of motion states that for every action, there is an equal and opposite reaction?", answer: "Newton's Third Law", category: "Force, Motion, and Energy" },
  { question: "The capacity to do work.", answer: "Energy", category: "Force, Motion, and Energy" },
  { question: "Name the ratio of output work to input work for a machine.", answer: "Efficiency", category: "Force, Motion, and Energy" },
  { question: "What is the force exerted by the pull of the Earth on an object?", answer: "Weight", category: "Force, Motion, and Energy" },
  { question: "A simple machine consisting of a wheel with a groove and a rope or cable passing through it.", answer: "Pulley", category: "Force, Motion, and Energy" },
  { question: "The time rate at which work is done or energy is transferred.", answer: "Power", category: "Force, Motion, and Energy" },
  { question: "The change in position of an object.", answer: "Motion", category: "Force, Motion, and Energy" },
  { question: "What term describes a system where no matter or energy can enter or leave?", answer: "Closed System", category: "Force, Motion, and Energy" },
  { question: "What force is responsible for keeping objects from falling through the floor or table?", answer: "Normal Force", category: "Force, Motion, and Energy" },
  { question: "The force of attraction that exists between all objects with mass.", answer: "Gravitational Force", category: "Force, Motion, and Energy" },
  { question: "What is the rate of flow of electric charge in a circuit?", answer: "Current", category: "Force, Motion, and Energy" },
  { question: "The measure of the difference in electrical potential energy between two points in a circuit.", answer: "Voltage", category: "Force, Motion, and Energy" },
  { question: "What term is used for a motion that repeats in a regular cycle, such as a swing?", answer: "Periodic Motion", category: "Force, Motion, and Energy" },
  { question: "Name the simple machine consisting of a rigid bar that pivots around a fixed point.", answer: "Lever", category: "Force, Motion, and Energy" },
  { question: "What energy transformation occurs in a hydroelectric dam?", answer: "Potential Energy to Kinetic Energy to Electrical Energy", category: "Force, Motion, and Energy" },
  { question: "The distance from one crest (or trough) of a wave to the next crest (or trough).", answer: "Wavelength", category: "Force, Motion, and Energy" },
  { question: "What type of energy is possessed by moving electrical charges?", answer: "Electrical Energy", category: "Force, Motion, and Energy" }
];

async function addAllQuestions() {
  try {
    await db.read();
    const store = db.data as any;
    if (!Array.isArray(store.quizBank)) {
      store.quizBank = [];
    }

    let addedCount = 0;

    // Helper function to add questions
    const addQuestions = async (questions: any[], type: 'multiple-choice' | 'identification', timeLimit: number) => {
      for (const q of questions) {
        const item: QuizBankItem = {
          id: 'qb_' + Math.random().toString(36).slice(2) + Date.now(),
          teacherId: '',
          type,
          category: q.category as any,
          question: q.question,
          options: type === 'multiple-choice' ? q.options : undefined,
          answer: q.answer,
          points: 1,
          timeLimit,
          createdAt: now(),
          updatedAt: now(),
        };
        store.quizBank.push(item);
        addedCount++;
        await new Promise(resolve => setTimeout(resolve, 5));
      }
    };

    console.log('📖 Adding Earth and Space questions...');
    await addQuestions(earthSpaceMC, 'multiple-choice', 60);
    await addQuestions(earthSpaceID, 'identification', 45);

    console.log('🌱 Adding Living Things and Their Environment questions...');
    await addQuestions(livingThingsMC, 'multiple-choice', 60);
    await addQuestions(livingThingsID, 'identification', 45);

    console.log('⚛️  Adding Matter questions...');
    await addQuestions(matterMC, 'multiple-choice', 60);
    await addQuestions(matterID, 'identification', 45);

    console.log('⚡ Adding Force, Motion, and Energy questions...');
    await addQuestions(forceMotionEnergyMC, 'multiple-choice', 60);
    await addQuestions(forceMotionEnergyID, 'identification', 45);

    await db.write();
    console.log(`\n✅ Successfully added ${addedCount} questions to Quiz Vault!`);
    console.log(`📚 Total questions in vault: ${store.quizBank.length}`);
    console.log('\n📊 Questions by Category:');
    const categories = ['Earth and Space', 'Living Things and Their Environment', 'Matter', 'Force, Motion, and Energy'];
    for (const cat of categories) {
      const count = store.quizBank.filter((q: any) => q.category === cat).length;
      console.log(`   • ${cat}: ${count} questions`);
    }
  } catch (error) {
    console.error('❌ Error adding questions:', error);
    process.exit(1);
  }
}

addAllQuestions();
