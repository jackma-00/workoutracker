def test_create_and_get_note(client):
    payload = {
        "title": "Push Day",
        "content": "Bench, incline DB, dips",
        "category": "WORKOUT",
        "is_pinned": True,
        "background_color": "#AABBCC",
    }

    created = client.post("/notes", json=payload)
    assert created.status_code == 201
    created_json = created.json()
    assert created_json["title"] == payload["title"]
    assert created_json["is_pinned"] is True

    note_id = created_json["id"]
    fetched = client.get(f"/notes/{note_id}")
    assert fetched.status_code == 200
    assert fetched.json()["category"] == "WORKOUT"


def test_filter_notes_by_category_and_pinned(client):
    client.post(
        "/notes",
        json={
            "title": "Meal prep",
            "content": "Chicken and rice",
            "category": "DIET",
            "is_pinned": False,
            "background_color": "#FFFFFF",
        },
    )
    client.post(
        "/notes",
        json={
            "title": "Leg day",
            "content": "Squats and RDL",
            "category": "WORKOUT",
            "is_pinned": True,
            "background_color": "#123456",
        },
    )

    diet_notes = client.get("/notes?category=diet")
    assert diet_notes.status_code == 200
    assert len(diet_notes.json()) == 1
    assert diet_notes.json()[0]["category"] == "DIET"

    pinned_notes = client.get("/notes?pinned=true")
    assert pinned_notes.status_code == 200
    assert len(pinned_notes.json()) == 1
    assert pinned_notes.json()[0]["is_pinned"] is True


def test_update_and_pin_flow(client):
    created = client.post(
        "/notes",
        json={
            "title": "Macros",
            "content": "180P/250C/60F",
            "category": "DIET",
            "is_pinned": False,
            "background_color": "#EFEFEF",
        },
    )
    note = created.json()

    updated = client.put(
        f"/notes/{note['id']}",
        json={
            "title": "Updated Macros",
            "content": "190P/240C/60F",
            "category": "DIET",
            "is_pinned": False,
            "background_color": "#EFEFEF",
        },
    )
    assert updated.status_code == 200
    assert updated.json()["title"] == "Updated Macros"

    pin_updated = client.patch(f"/notes/{note['id']}/pin", json={"is_pinned": True})
    assert pin_updated.status_code == 200
    assert pin_updated.json()["is_pinned"] is True


def test_delete_note(client):
    created = client.post(
        "/notes",
        json={
            "title": "Temp",
            "content": "To be removed",
            "category": "WORKOUT",
            "is_pinned": False,
            "background_color": "#000000",
        },
    )
    note_id = created.json()["id"]

    deleted = client.delete(f"/notes/{note_id}")
    assert deleted.status_code == 204

    fetched = client.get(f"/notes/{note_id}")
    assert fetched.status_code == 404


def test_notes_sort_updated_items_first(client):
    first = client.post(
        "/notes",
        json={
            "title": "First",
            "content": "Original",
            "category": "WORKOUT",
            "is_pinned": False,
            "background_color": "#111111",
        },
    ).json()
    second = client.post(
        "/notes",
        json={
            "title": "Second",
            "content": "Later create",
            "category": "WORKOUT",
            "is_pinned": False,
            "background_color": "#222222",
        },
    ).json()

    updated = client.put(
        f"/notes/{first['id']}",
        json={
            "title": "First updated",
            "content": "Now edited",
            "category": "WORKOUT",
            "is_pinned": False,
            "background_color": "#111111",
        },
    )
    assert updated.status_code == 200

    notes = client.get("/notes").json()
    assert notes[0]["id"] == first["id"]
    assert notes[1]["id"] == second["id"]


def test_cors_preflight_allows_frontend_origin(client):
    response = client.options(
        "/notes",
        headers={
            "Origin": "http://127.0.0.1:5173",
            "Access-Control-Request-Method": "POST",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:5173"
