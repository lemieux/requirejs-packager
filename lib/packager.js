'use strict';
var Parser = require('madge/lib/parse/amd');
var _ = require('lodash');
var util = require('util');
var printer = require('./print');

module.exports = function(src, opts) {
    return new Packager(src, opts);
};

function TreeEntry(id, dependencies, usedBy) {
    this.id = id;
    this.dependencies = dependencies;
    this.usedBy = usedBy;
}

TreeEntry.prototype = {
    get usedByCount() {
        return this.usedBy.length;
    },
    get dependencyCount() {
        return this.dependencies.length;
    },
    clone: function() {
        return new TreeEntry(this.id, _.cloneDeep(this.dependencies), _.cloneDeep(this.usedBy));
    }
};

function Packager(src, opts) {
    this.opts = opts || {};
    this.tree = this._buildTree(new Parser(src, opts).tree);
}

_.extend(Packager.prototype, {
    _buildTree: function(rawTree) {
        var tree = {};

        _.forIn(rawTree, function(dependencies, id) {
            tree[id] = this._buildTreeEntry(id, dependencies, []);
        }, this);
        this._buildReverseDependencies(tree);

        return tree;
    },

    _buildTreeEntry: function(id, dependencies, usedBy) {
        return new TreeEntry(id, dependencies, usedBy);
    },

    _buildReverseDependencies: function(tree) {
        _.forIn(tree, function(properties, id) {
            _.each(properties.dependencies, function(dependencyId) {
                var entry = this._getTreeEntry(tree, dependencyId);

                if (!_.contains(entry.usedBy, id)) {
                    entry.usedBy.push(id);
                }
            }, this);
        }, this);
    },

    _getTreeEntry: function(tree, id) {
        var module = tree[id];
        if (!module) {
            module = this._buildTreeEntry(id, [], []);
            tree[id] = module;
        }
        return module;
    },

    showTree: function() {
        console.log(this.tree);
    },

    showDependencyFrequencyList: function() {
        var pairs = _.pairs(this.tree);
        var mappedList = _.map(pairs, function(pair) {
            var entry = pair[1].clone();
            entry.id = pair[0];
            return entry;
        });

        var sortedList = _.sortBy(mappedList, 'usedByCount');
        printer.printSortedTree(sortedList);
    },

    showSummary: function(){
        var pairs = _.pairs(this.tree);
        var mappedList = _.map(pairs, function(pair) {
            var entry = pair[1].clone();
            entry.id = pair[0];
            return entry;
        });

        var sortedList = _.sortBy(mappedList, 'usedByCount');
        _.each(sortedList.reverse(), function(entry){
            util.puts(util.format("%s : %d", entry.id, entry.usedByCount));
        });
    }
});