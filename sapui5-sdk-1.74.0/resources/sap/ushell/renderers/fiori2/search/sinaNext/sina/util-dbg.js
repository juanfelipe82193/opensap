// Copyright (c) 2009-2017 SAP SE, All Rights Reserved
/* global sinaDefine */
sinaDefine(['./ComparisonOperator'], function (ComparisonOperator) {
    "use strict";

    var module = {};

    module.convertOperator2Wildcards = function (value, operator) {

        if (operator === ComparisonOperator.Eq) {

            return value;

        }

        var result = [];
        var values = value.split(' ');
        for (var i = 0; i < values.length; i++) {
            var trimedValue = values[i].trim();
            if (trimedValue.length === 0) {
                continue;
            }

            switch (operator) {
            case ComparisonOperator.Co:
                trimedValue = '*' + trimedValue + '*';
                break;
            case ComparisonOperator.Bw:
                trimedValue = trimedValue + '*';
                break;
            case ComparisonOperator.Ew:
                trimedValue = '*' + trimedValue;
                break;
            default:
                break;
            }

            result.push(trimedValue);
        }

        return result.join(' ');


    };

    return module;

});
