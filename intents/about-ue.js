const fetch = require('node-fetch');
const { Suggestion } = require('dialogflow-fulfillment');


async function fetchOneUE(code) {
  try {
    return await fetch(`http://assistantutt.ga:8080/ue/${code}`)
      .then(result => result.json());

  } catch (err) {
    console.log(`An error occured when fetching one UE : ${err}`);
    return new Error('Error when fetching UE')
  }
}

module.exports = async function handleAboutUE(agent) {
  console.log(`${agent.intent} called with parameters : ${JSON.stringify(agent.parameters)}`)
  const { codeUE } = agent.parameters;
  let slotfiller = false;
  if(codeUE) {
    // if Dialogflow detected an UE entity in the user request
    return await fetchOneUE(codeUE)
      .then((ue) => {
        let suggestion = new Suggestion('Objectifs de l\'UE');

        const context = {
          name: 'context-UE',
          lifespan: 1,
          parameters: { ue },
        }

        agent.add(`${ue.code} : ${ue.titre}.\nC'est une UE qui donne ${ue.categorie} qui donne ${ue.credits} crédits ECTS.`);
        agent.add(suggestion);

        agent.setContext(context);
      });
  } else {
    // This is when user hasn't mentioned any UE name.
    if (!agent.getContext('context-wrongUE')) {
      agent.add('Vous voulez des infos sur quelle UE?');
    } else {
      agent.add('Pardon, je ne connais pas cette UE !');
      agent.setContext({
        name: 'context-wrongUE',
        lifespan: '3',
        parameters: {},
      });
    }

  }
}