'use strict';
var util = require('util');
var _ = require('lodash');

function Printer(){}

Printer.prototype = {
    printTreeEntry: function(entry) {
        var value = "{ \n";
        value += util.format("\tdependencyCount: %d, \n", entry.dependencyCount);
        value += util.format("\tusedByCount: %d, \n", entry.usedByCount);
        value += "\tdependencies: [\n";
        _.each(entry.dependencies, function(dependency) {
            value += util.format("\t\t%s \n", dependency);
        }, entry);
        value += "\t], \n";

        value += "\tusedBy: [\n";
        _.each(entry.usedBy, function(dependency) {
            value += util.format("\t\t%s \n", dependency);
        }, entry);
        value += "\t] \n";
        value += "}";

        return value;
    },
    printTree: function(tree) {

    },

    printSortedTree: function(sortedList) {
        _.each(sortedList, function(entry, i) {
            var value = this.printTreeEntry(entry) + (i < sortedList.length - 1 ? ',' : '');
            util.puts(value);
        }, this);
    }
};

module.exports = new Printer();
