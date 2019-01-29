module.exports = {
    "GET":
        `SELECT
            P1.ns_identifier,
            P2.ns_name,
            P1.mm_identifier,
            P1.mm_name,
            P1.bundle_identifier,
            P1.mm_description,
            P1.create_time
        FROM
            mix_module P1
        LEFT JOIN name_space P2 ON P1.ns_identifier = P2.ns_identifier`,
    "POST":
        `INSERT INTO mix_module (
            ns_identifier,
            mm_identifier,
            mm_name,
            bundle_identifier,
            mm_description,
            create_time
        )
        VALUES
            (
                '#ns_identifier',
                '#mm_identifier',
                '#mm_name',
                '#bundle_identifier',
                '#mm_description',
                '#create_time'
            )`,
    "PUT":
        "UPDATE mix_module SET mm_name = '#mm_name',mm_description = '#mm_description',bundle_identifier = '#bundle_identifier' where mm_identifier = '#mm_identifier'",
    "DELETE":
        "DELETE FROM mix_module where mm_identifier = '#mm_identifier'"
}