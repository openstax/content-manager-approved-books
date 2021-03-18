import json
import argparse

MIN_CODE_VERSION = "20210224.204120"


def convert_abl(abl_json_file, slugs_by_uuid):
    updated_abl_data = {
        "approved_books": [],
        "approved_versions": []
    }
    known_books = set()
    known_versions = set()

    with open(abl_json_file, encoding="utf-8") as json_input:
        abl_data = json.load(json_input)

    for book_entry in abl_data:
        collection_id = book_entry["collection_id"]
        collection_version = book_entry["version"]
        collection_hash = f"{collection_id}@{collection_version}"
        book = {
            "collection_id": collection_id,
            "server": book_entry["server"],
            "style": book_entry["style"],
            "tutor_only": book_entry["tutor_only"],
            "books": [
                {
                    "uuid": book_entry["uuid"],
                    "slug": slugs_by_uuid[book_entry["uuid"]]
                }
            ]
        }
        version = {
            "collection_id": collection_id,
            "content_version": collection_version,
            "min_code_version": MIN_CODE_VERSION
        }
        if collection_id not in known_books:
            updated_abl_data["approved_books"].append(book)
            known_books.add(collection_id)

        if collection_hash not in known_versions:
            updated_abl_data["approved_versions"].append(version)
            known_versions.add(collection_hash)

    return updated_abl_data


def get_slugs_by_uuid(book_slugs_file):
    data = {}
    with open(book_slugs_file, encoding="utf-8") as json_input:
        slugs_data = json.load(json_input)

    for entry in slugs_data:
        data[entry["uuid"]] = entry["slug"]

    return data


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("input_abl_json_file")
    parser.add_argument("book_slugs_json_file")
    parser.add_argument("output_abl_json_file")
    args = parser.parse_args()

    slugs_by_uuid = get_slugs_by_uuid(args.book_slugs_json_file)

    updated_abl_json = convert_abl(
        args.input_abl_json_file,
        slugs_by_uuid
    )

    with open(args.output_abl_json_file, "w", encoding="utf-8") as json_output:
        json_string = json.dumps(
            updated_abl_json,
            indent=2,
            ensure_ascii=False
        )
        json_output.write(json_string)


if __name__ == "__main__":
    main()
