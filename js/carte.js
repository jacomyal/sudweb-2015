(function() {
  // Communities:
  var communities = [
        { id: 4,
          label: 'Développement Web',
          color: '#cb3434' },
        { id: 10,
          label: 'Web et société',
          color: '#34cba2' },
        { id: 9,
          label: 'Accessibilité',
          color: '#cb8634' },
        { id: 8,
          label: 'Référencement',
          color: '#34a2cb' },
      ],
      communitiesIndex = communities.reduce(function(index, obj) {
        index[obj.id] = obj;
        return index;
      }, {});

  // Add a "isNeighbor" function to sigma graph:
  sigma.classes.graph.addMethod('areNeighbors', function(n1, n2) {
    return (n1 === n2) || !!this.allNeighborsIndex[n1][n2];
  });

  // Instanciate sigma.js:
  var map = new sigma({
    renderer: {
      container: document.querySelector('#sigma-container'),
      type: 'canvas'
    },
    settings: {
      defaultEdgeColor: '#ccc',
      edgeColor: 'default',
      minNodeSize: 3,
      maxNodeSize: 15,
      minEdgeSize: 0.1,
      maxEdgeSize: 3,
      defaultEdgeType: 'arrow',
      minArrowSize: 8
    }
  });

  sigma.parsers.json(
    'data/travailleurs-du-web-final.json',
    map,
    function() {
      map.graph.nodes().forEach(function(node) {
        // Set community color:
        node.color = communitiesIndex[node.community].color;

        // Save initial state:
        node.save = {
          label: node.label,
          color: node.color
        }
      });

      bootstrapCaption();
      map.refresh();
    }
  );

  // Captions:
  function bootstrapCaption() {
    document.querySelector('.communities ul').innerHTML =
      communities.map(function(obj) {
        return [
          '<li>',
            '<span ',
              'class="circle"',
              'style="background:' + obj.color + '"></span>',
            '<span>' + obj.label + '</span>',
          '</li>'
        ].join('');
      }).join('');

    document.querySelector('.graph ul').innerHTML =
      [ '<li>' + map.graph.nodes().length + ' noeuds</li>',
        '<li>' + map.graph.edges().length + ' arcs</li>' ].join('');

    document.querySelector('#caption').style.opacity = 1;
  }




  // MODEL:
  // ******
  var state = {
    hovered: null,
    selected: null
  };
  function setState(key, value) {
    var doRefresh = false;
    if (typeof key === 'object' && arguments.length === 1)
      for (var k in key) {
        if (state[k] !== key[k]) {
          state[k] = key[k];
          doRefresh = true;
        }
      }

    else
      if (state[key] !== value) {
        state[key] = value;
        doRefresh = true;
      }

    if (doRefresh)
      refresh();
  }




  // VIEW:
  // *****
  function refresh() {
    map.graph.nodes().forEach(function(node) {
      // Show only selected node's neighbors:
      node.hidden =
        state.selected ?
          !map.graph.areNeighbors(node.id, state.selected) :
          false;

      // Highlight hovered node's neighbors:
      node.color =
        ( state.hovered &&
          !map.graph.areNeighbors(node.id, state.hovered) ) ?
          '#ccc' :
          node.save.color;

      node.label =
        ( state.hovered &&
          !map.graph.areNeighbors(node.id, state.hovered) ) ?
          null :
          node.save.label;
    });

    map.graph.edges().forEach(function(edge) {
      edge.hidden =
        state.hovered &&
        ( !map.graph.areNeighbors(edge.source, state.hovered) ||
          !map.graph.areNeighbors(edge.target, state.hovered) );
    });

    map.render();
  }



  // ACTIONS:
  // ********
  map
    .bind('overNode', function(e) {
      setState('hovered', e.data.node.id);
    })
    .bind('outNode', function(e) {
      setState('hovered', null);
    })
    .bind('clickNode', function(e) {
      setState('selected', e.data.node.id);
    })
    .bind('clickStage', function(e) {
      if (!e.data.captor.isDragging)
        setState('selected', null);
    });
})();
