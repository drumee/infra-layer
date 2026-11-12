"""Executable design checks, not a production validator or CLI implementation."""
import ipaddress
import json
import pathlib
import sys

import jsonschema

root = pathlib.Path(__file__).resolve().parents[1]
schema = json.loads((root/'mail-service.v1.schema.json').read_text())
jsonschema.Draft202012Validator.check_schema(schema)
validator = jsonschema.Draft202012Validator(schema, format_checker=jsonschema.FormatChecker())


def check(value):
    validator.validate(value)
    dep = value['deployment']
    a, b = pathlib.PurePosixPath(dep['root']), pathlib.PurePosixPath(dep['backup_root'])
    if a == b or a in b.parents or b in a.parents:
        raise ValueError('overlapping-roots')
    domains = set(value['domains'])
    if {entry['domain'] for entry in value['dkim']} != domains or len(value['dkim']) != len(domains):
        raise ValueError('dkim-domain-coverage')
    net = value['networks']
    subnet = ipaddress.ip_network(net['edge_subnet'], strict=True)
    gateway = ipaddress.ip_address(net['edge_gateway'])
    if not gateway in subnet or not gateway.is_private or net['private_submission']['address'] != str(gateway):
        raise ValueError('invalid-gateway')
    for entry in net['private_submission']['allowed_sources']:
        source = ipaddress.ip_network(entry, strict=True)
        if source.prefixlen == 0 or not source.is_private or source.overlaps(subnet):
            raise ValueError('unsafe-source')
    out = value['outbound']
    if out.get('minimal_backoff_seconds', 300) > out.get('maximal_backoff_seconds', 4000):
        raise ValueError('backoff-order')


results = []
for file in sorted((root/'examples').glob('*.json')):
    expected = '.valid.' in file.name
    try:
        check(json.loads(file.read_text()))
        valid = True
    except (jsonschema.ValidationError, ValueError):
        valid = False
    results.append({'file':file.name, 'expected_valid':expected, 'observed_valid':valid, 'pass':valid == expected})
print(json.dumps({'scope':'MAIL-01 schema + selected semantic design hypotheses; no filesystem/runtime validation',
                  'cases':results, 'status':'PASS' if all(x['pass'] for x in results) else 'FAIL'}, indent=2))
sys.exit(0 if all(x['pass'] for x in results) else 1)
