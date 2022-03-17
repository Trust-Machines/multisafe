const TRAIT_BASE = {
    MAINNET: "SP3XD84X3PE79SHJAZCDW1V5E9EA8JSKRBPEKAEK7.multisafe-traits"
};

function makeTraits(code){
    return code.replace(/ .traits/g,` '${TRAIT_BASE.MAINNET}`, "g");
}

function makeInit(code, owners, minRequirement){
    const init = `(init (list\n '${owners.join("\n '")} \n) u${minRequirement}) `;
    return code.replace(/\(init \(list((.|\n)*)\)/, init);
}

function makeSafeContract (code, owners, minRequirement){
    return makeInit(makeTraits(code), owners, minRequirement);
}

module.exports = {
    makeSafeContract,
    TRAIT_BASE
}