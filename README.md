# Json Data Viewer

A parser that can dynamically take any JSON input, display information about that data, display options for filtering data, 
and returning the filtered data. 


# Documentation:

## Query Rules:

* If checking a field exists:
```js
    { and : [ field1, field2 ] }
    
    { or : [ field1, field2 ] }
```

* If filtering field value: 
```js
    { and : [ { field: _nameA_, equal: '_blah_' } ] }
    
    { and : [ { field: _nameA_, less: '_blah_' } ] }

    { and : [ { field: _nameA_, greater: '_blah_' } ] }
```    

* Filter with options:
```js
    { and : [ { field: _nameA_, equal: { or: ['optionA', 'optionB'] } } ] }
```

* If nesting:

```js
    { and: [ { field: top_level, and: [nested_level_field] } ] }

    { and: [ { field: top_level, and: [nested_level_field] } ] }
```

* examples:

```js
    {"and": ["id", {"field": "batters", "and": ["batter"]}]}

    {"or": [{"and": ["last_name", "middle_name"]}, {"and": ["first_name"]}]}

    {"and": [{"field": "first_name", "equal": ["Noell"]},{"field": "last_name", "equal": ["Bea"]}]}

```