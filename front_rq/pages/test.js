import React from 'react';

const Test = () => {
    const groupBy = function (data, key) {
        return data.reduce(function (carry, el, i) {
            const group = el[key];
            if (carry[group] === undefined) {
                carry[group] = []
            }
    
            carry[group].push(el)
            return carry
        }, [])
    }
    
    const data = [
        { category: 'A', id: 2, order: 1, content: '111', qty: 5 },
        { category: 'B', id: 4, order: 1, content: '222', qty: 5 },
        { category: 'B', id: 4, order: 2, content: '3333 b', qty: 5 },
        { category: 'C', id: 5, order: 2, content: '4444 C', qty: 5 },
    ];
    const newData = groupBy(data, 'category');

    return (
        <h1>a</h1>
    );
};

export default Test;
