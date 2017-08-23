var canvas; 
var ctx;
var height = 400;
var width = 400;

var data = [
    [1, 2, 2],
    [2, 1, 3],
    [2, 4, 10], 
    [1, 3, 4],
    [2, 2, 5],
    [3, 1, 4],
    [1, 1, 9],

    [7, 3, 6],
    [8, 2, 6],
    [6, 4, 3],
    [7, 4, 5],
    [8, 1, 2],
    [9, 2, 9],

    [10, 8, 9],
    [9, 10, 2],
    [7, 8, 10],
    [7, 9, 4],
    [8, 11, 6],
    [9, 9, 9],
];

var means = [];
var assignments = [];
var dataExtremes;
var dataRange;
var drawDelay = 2000;

function getDataRanges(extremes) {  
    var ranges = [];
    for (var dimension in extremes){
        ranges[dimension] = extremes[dimension].max - extremes[dimension].min;
    }
    return ranges;

}

function getDataExtremes(points) {
    var maxpossible_min = 1000;
    var extremes = [];

    for (var i in data){
        var point = data[i];

        for (var dimension in point){
            if ( ! extremes[dimension] ){
                extremes[dimension] = {min: maxpossible_min, max: 0};
            }

            if (point[dimension] < extremes[dimension].min){
                extremes[dimension].min = point[dimension];
            }

            if (point[dimension] > extremes[dimension].max){
                extremes[dimension].max = point[dimension];
            }
        }
    }

    return extremes;
}

function initMeans(k) {
    if ( ! k ){
        k = 3;
    }

    while (k--){
        var mean = [];

        for (var dimension in dataExtremes){
            mean[dimension] = dataExtremes[dimension].min + ( Math.random() * dataRange[dimension] );
        }
        means.push(mean);
    }
    return means;
}

function makeAssignments() {
    for (var i in data){
        var point = data[i];
        var distances = [];

        for (var j in means){
            var mean = means[j];
            var sum = 0;

            for (var dimension in point){
                var difference = point[dimension] - mean[dimension];
                difference *= difference;
                sum += difference;
            }
            distances[j] = Math.sqrt(sum);
        }
        assignments[i] = distances.indexOf( Math.min.apply(null, distances) );
    }
}

function moveMeans() {

    makeAssignments();

    var sums = Array( means.length );
    var counts = Array( means.length );
    var moved = false;

    for (var j in means)
    {
        counts[j] = 0;
        sums[j] = Array( means[j].length );
        for (var dimension in means[j])
        {
            sums[j][dimension] = 0;
        }
    }

    for (var point_index in assignments)
    {
        var mean_index = assignments[point_index];
        var point = data[point_index];
        var mean = means[mean_index];

        counts[mean_index]++;

        for (var dimension in mean)
        {
            sums[mean_index][dimension] += point[dimension];
        }
    }

    for (var mean_index in sums)
    {
        console.log(counts[mean_index]);
        if ( 0 === counts[mean_index] ) 
        {
            sums[mean_index] = means[mean_index];
            console.log("Mean with no points");
            console.log(sums[mean_index]);

            for (var dimension in dataExtremes)
            {
                sums[mean_index][dimension] = dataExtremes[dimension].min + ( Math.random() * dataRange[dimension] );
            }
            continue;
        }

        for (var dimension in sums[mean_index])
        {
            sums[mean_index][dimension] /= counts[mean_index];
        }
    }

    if (means.toString() !== sums.toString())
    {
        moved = true;
    }

    means = sums;

    return moved;

}

function setup() {

    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    dataExtremes = getDataExtremes(data);
    dataRange = getDataRanges(dataExtremes);
    means = initMeans(3);
    //console.debug("dX: "+dataExtremes[2].min); //each dimansion has min & max value
    console.log("dR: "+dataRange);
    console.log("m: "+means);

    makeAssignments();
    draw();

    setTimeout(run, drawDelay);
}

function run() {
    console.log("cluster1 x:"+means[0][0]+" y:"+means[0][1]+" z:"+means[0][2]);
    console.log("cluster2 x:"+means[1][0]+" y:"+means[1][1]+" z:"+means[1][2]);
    console.log("cluster3 x:"+means[2][0]+" y:"+means[2][1]+" z:"+means[2][2]);

    var moved = moveMeans();
    draw();

    if (moved)
    {
        setTimeout(run, drawDelay);
    }

}

function draw() {

    ctx.clearRect(0,0,width, height);

    ctx.globalAlpha = 0.3;
    for (var point_index in assignments)
    {
        var mean_index = assignments[point_index];
        var point = data[point_index];
        var mean = means[mean_index];

        ctx.save();

        ctx.strokeStyle = 'blue';
        ctx.beginPath();
        ctx.moveTo(
            (point[0] - dataExtremes[0].min + 1) * (width / (dataRange[0] + 2) ),
            (point[1] - dataExtremes[1].min + 1) * (height / (dataRange[1] + 2) )
        );
        ctx.lineTo(
            (mean[0] - dataExtremes[0].min + 1) * (width / (dataRange[0] + 2) ),
            (mean[1] - dataExtremes[1].min + 1) * (height / (dataRange[1] + 2) )
        );
        ctx.stroke();
        ctx.closePath();
    
        ctx.restore();
    }
    ctx.globalAlpha = 1;

    for (var i in data)
    {
        ctx.save();

        var point = data[i];

        var x = (point[0] - dataExtremes[0].min + 1) * (width / (dataRange[0] + 2) );
        var y = (point[1] - dataExtremes[1].min + 1) * (height / (dataRange[1] + 2) );

        ctx.strokeStyle = '#333333';
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI*2, true);
        ctx.stroke();
        ctx.closePath();

        ctx.restore();
    }

    for (var i in means)
    {
        ctx.save();

        var point = means[i];

        var x = (point[0] - dataExtremes[0].min + 1) * (width / (dataRange[0] + 2) );
        var y = (point[1] - dataExtremes[1].min + 1) * (height / (dataRange[1] + 2) );

        ctx.fillStyle = 'green';
        ctx.translate(x, y);
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI*2, true);
        ctx.fill();
        ctx.closePath();

        ctx.restore();

    }

}

setup();












var elements = {"Hydrogen":{"weight":389,"value":400},"Helium":{"weight":309,"value":380},"Lithium":{"weight":339,"value":424},"Beryllium":{"weight":405,"value":387},"Boron":{"weight":12,"value":174},"Carbon":{"weight":298,"value":483},"Nitrogen":{"weight":409,"value":303},"Oxygen":{"weight":432,"value":497},"Fluorine":{"weight":414,"value":306},"Neon":{"weight":149,"value":127},"Sodium":{"weight":247,"value":341},"Magnesium":{"weight":327,"value":98},"Aluminium":{"weight":195,"value":343},"Silicon":{"weight":356,"value":122},"Phosphorus":{"weight":49,"value":157},"Sulfur":{"weight":151,"value":438},"Chlorine":{"weight":56,"value":460},"Argon":{"weight":317,"value":395},"Potassium":{"weight":383,"value":221},"Calcium":{"weight":281,"value":395},"Scandium":{"weight":394,"value":79},"Titanium":{"weight":377,"value":303},"Vanadium":{"weight":381,"value":308},"Chromium":{"weight":299,"value":295},"Manganese":{"weight":114,"value":447},"Iron":{"weight":422,"value":360},"Cobalt":{"weight":288,"value":249},"Nickel":{"weight":458,"value":482},"Copper":{"weight":91,"value":314},"Zinc":{"weight":104,"value":140},"Gallium":{"weight":470,"value":254},"Germanium":{"weight":77,"value":25},"Arsenic":{"weight":213,"value":393},"Selenium":{"weight":419,"value":96},"Bromine":{"weight":114,"value":199},"Krypton":{"weight":490,"value":8},"Rubidium":{"weight":278,"value":367},"Strontium":{"weight":310,"value":159},"Yttrium":{"weight":175,"value":109},"Zirconium":{"weight":453,"value":288},"Niobium":{"weight":56,"value":375},"Molybdenum":{"weight":147,"value":343},"Technetium":{"weight":123,"value":105},"Ruthenium":{"weight":325,"value":214},"Rhodium":{"weight":418,"value":428},"Palladium":{"weight":353,"value":387},"Silver":{"weight":182,"value":429},"Cadmium":{"weight":411,"value":394},"Indium":{"weight":322,"value":329},"Tin":{"weight":490,"value":436},"Antimony":{"weight":28,"value":479},"Tellurium":{"weight":443,"value":305},"Iodine":{"weight":345,"value":253},"Xenon":{"weight":463,"value":19},"Caesium":{"weight":361,"value":416},"Barium":{"weight":307,"value":417},"Lanthanum":{"weight":291,"value":453},"Cerium":{"weight":259,"value":414},"Praseodymium":{"weight":58,"value":83},"Neodymium":{"weight":127,"value":475},"Promethium":{"weight":11,"value":480},"Samarium":{"weight":361,"value":192},"Europium":{"weight":409,"value":271},"Gadolinium":{"weight":86,"value":231},"Terbium":{"weight":100,"value":75},"Dysprosium":{"weight":166,"value":128},"Holmium":{"weight":54,"value":109},"Erbium":{"weight":432,"value":399},"Thulium":{"weight":361,"value":395},"Ytterbium":{"weight":417,"value":222},"Lutetium":{"weight":311,"value":224},"Hafnium":{"weight":138,"value":101},"Tantalum":{"weight":177,"value":397},"Tungsten":{"weight":14,"value":234},"Rhenium":{"weight":480,"value":141},"Osmium":{"weight":208,"value":490},"Iridium":{"weight":121,"value":68},"Platinum":{"weight":182,"value":29},"Gold":{"weight":339,"value":267},"Mercury":{"weight":259,"value":438},"Thallium":{"weight":342,"value":425},"Lead":{"weight":65,"value":395},"Bismuth":{"weight":33,"value":497},"Polonium":{"weight":293,"value":394},"Astatine":{"weight":392,"value":210},"Radon":{"weight":116,"value":203},"Francium":{"weight":433,"value":253},"Radium":{"weight":303,"value":109},"Actinium":{"weight":149,"value":317},"Thorium":{"weight":342,"value":129},"Protactinium":{"weight":457,"value":50},"Uranium":{"weight":118,"value":77},"Neptunium":{"weight":117,"value":300},"Plutonium":{"weight":106,"value":455},"Americium":{"weight":66,"value":365},"Curium":{"weight":393,"value":407},"Berkelium":{"weight":289,"value":458},"Californium":{"weight":302,"value":322},"Einsteinium":{"weight":455,"value":94},"Fermium":{"weight":216,"value":347},"Mendelevium":{"weight":304,"value":331},"Nobelium":{"weight":49,"value":236},"Lawrencium":{"weight":84,"value":351},"Rutherfordium":{"weight":345,"value":233},"Dubnium":{"weight":168,"value":187},"Seaborgium":{"weight":361,"value":125},"Bohrium":{"weight":236,"value":479},"Hassium":{"weight":201,"value":353},"Meitnerium":{"weight":278,"value":307},"Darmstadtium":{"weight":308,"value":344},"Roentgenium":{"weight":171,"value":201},"Copernicium":{"weight":251,"value":460},"Ununtrium":{"weight":158,"value":52},"Ununquadium":{"weight":282,"value":113},"Ununpentium":{"weight":145,"value":497},"Ununhexium":{"weight":459,"value":449},"Ununseptium":{"weight":327,"value":7},"Ununoctium":{"weight":184,"value":411}};

function length(obj) {
    var length = 0;
    for (var i in obj)
        length++;
    return length;
}
function clone(obj) {
    obj = JSON.parse(JSON.stringify(obj));
    return obj;
}
function pickRandomProperty(obj) {
    var result;
    var count = 0;
    for (var prop in obj)
        if (Math.random() < 1 / ++count)
           result = prop;
    return result;
}

var Chromosome = function(members) {
    this.members = members;
    for (var element in this.members)
    {
        if (typeof this.members[element]['active'] == 'undefined')
        {
            this.members[element]['active'] = Math.round( Math.random() );
        }
    }
    this.mutate();
    this.calcScore();
};
Chromosome.prototype.mutate = function() {
    if (Math.random() > this.mutationRate)
        return false;
    var element = pickRandomProperty(this.members);
    this.members[element]['active'] = Number(! this.members[element]['active']);
};
Chromosome.prototype.calcScore = function() {
    if (this.score)
        return this.score;

    this.value = 0;
    this.weight = 0;
    this.score = 0;

    for (var element in this.members)
    {
        if (this.members[element]['active'])
        {
            this.value += this.members[element]['value'];
            this.weight += this.members[element]['weight'];
        }
    }

    this.score = this.value;

    if (this.weight > this.maxWeight)
    {
        this.score -= (this.weight - this.maxWeight) * 50;
    }

    return this.score;
};
Chromosome.prototype.mateWith = function(other) {
    var child1 = {};
    var child2 = {};
    var pivot = Math.round( Math.random() * (length(this.members) - 1) );
    var i = 0;
    for (var element in elements)
    {
        if (i < pivot)
        {
            child1[element] = clone(this.members[element]);
            child2[element] = clone(other.members[element]);
        }
        else
        {
            child2[element] = clone(this.members[element]);
            child1[element] = clone(other.members[element]);
        }
        i++;
    }

    child1 = new Chromosome(child1);
    child2 = new Chromosome(child2);

    return [child1, child2];
};
Chromosome.prototype.weight = 0;
Chromosome.prototype.value = 0;
Chromosome.prototype.members = [];
Chromosome.prototype.maxWeight = 1000;
Chromosome.prototype.mutationRate = 0.7;
Chromosome.prototype.score = 0;


var Population = function(elements, size)
{
    if ( ! size )
        size = 20;
    this.elements = elements;
    this.size = size;
    this.fill();
};
Population.prototype.fill = function() {
    while (this.chromosomes.length < this.size)
    {
        if (this.chromosomes.length < this.size / 3)
        {
            this.chromosomes.push( new Chromosome( clone(this.elements) ) );
        }
        else
        {
            this.mate();
        }
    }
};
Population.prototype.sort = function() {
    this.chromosomes.sort(function(a, b) { return b.calcScore() - a.calcScore(); });
};
Population.prototype.kill = function() {
    var target = Math.floor( this.elitism * this.chromosomes.length );
    while (this.chromosomes.length > target)
    {
        this.chromosomes.pop();
    }
};
Population.prototype.mate = function() {
    var key1 = pickRandomProperty(this.chromosomes);
    var key2 = key1;

    while (key2 == key1)
    {
        key2 = pickRandomProperty(this.chromosomes);
    }

    var children = this.chromosomes[key1].mateWith(this.chromosomes[key2]);
    this.chromosomes = this.chromosomes.concat(children);
};
Population.prototype.generation = function(log) {
    this.sort();
    this.kill();
    this.mate();
    this.fill();
    this.sort();
};
Population.prototype.display = function(i, noImprovement) {
    document.getElementById('gen_no').innerHTML = i;
    document.getElementById('weight').innerHTML = this.chromosomes[0].weight;
    document.getElementById('value').innerHTML = this.chromosomes[0].score;
    document.getElementById('nochange').innerHTML = noImprovement;
    
};
Population.prototype.run = function(threshold, noImprovement, lastScore, i) {
    if ( ! threshold )
        threshold = 1000;
    if ( ! noImprovement )
        noImprovement = 0;
    if ( ! lastScore )
        lastScore = false;
    if ( ! i )
        i = 0;

    if (noImprovement < threshold)
    {
        lastScore = this.chromosomes[0].calcScore();
        this.generation();

        if (lastScore >= this.chromosomes[0].calcScore())
        {
            noImprovement++;
        }
        else
        {
            noImprovement = 0;
        }
        
        i++;

        if (i % 10 == 0)
            this.display(i, noImprovement);
        var scope = this;
        setTimeout(function() { scope.run(threshold, noImprovement, lastScore, i) }, 1);

        return false;

    }
    this.display(i, noImprovement);
};


Population.prototype.elitism = 0.2;
Population.prototype.chromosomes = [];
Population.prototype.size = 100;
Population.prototype.elements = false;

                   
var p;
p = new Population(clone(elements));

document.getElementById('runbutton').onclick = function() {
   p.run(document.getElementById('runfor').value);
};


