﻿// ==========================================================================
//  Squidex Headless CMS
// ==========================================================================
//  Copyright (c) Squidex UG (haftungsbeschraenkt)
//  All rights reserved. Licensed under the MIT license.
// ==========================================================================

namespace Squidex.Infrastructure.Json.Objects
{
    public sealed class JsonNumber : JsonScalar<double>
    {
        public override JsonValueType Type
        {
            get { return JsonValueType.Number; }
        }

        internal JsonNumber(double value)
            : base(value)
        {
        }

        public override string ToJsonString()
        {
            return $"{Value}";
        }
    }
}
