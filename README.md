# BEELIVE

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## APIS

`GET base_url/levels`

```json
{
  "levels": [
    {
      "id": "L01",
      "name": "Supply Chain CCS",
      "description": "This is the first (top) level of the organization.",
      "level_summary": {
        "active": 4,
        "inactive": 5,
        "normal": 5,
        "warnings": 2,
        "critical": 3
      },
      "children": [
        {
          "id": "L01.01",
          "name": "CSS Cold Rooms",
          "description": "",
          "level_summary": {
            "active": 4,
            "inactive": 5,
            "normal": 5,
            "warnings": 2,
            "critical": 3
          },
          "children": [
            {
              "id": "L01.01.01.01",
              "name": "CSS New Cold Room 001",
              "description": "",
              "level_summary": {
                "active": 4,
                "inactive": 5,
                "normal": 5,
                "warnings": 2,
                "critical": 3
              },
              "has_sensor": true,
              "sensor_data": [
                {
                  "sensor_id": "1",
                  "sensor_type": "temperature",
                  "sensor_value": 20,
                  "widget_url": "http://3.0.17.163:8080/d-solo/ae9ukan9xufpca/l01-01-01-01?orgId=1&from=1736676000000&to=1736681700000&timezone=browser&panelId=2&__feature.dashboardSceneSolo"
                }
              ],
              "children": [],
              "type": "COLD_ROOM"
            },
            {
              "id": "L01.01.01.02",
              "name": "CSS Old Cold Room",
              "description": "",
              "level_summary": {
                "active": 4,
                "inactive": 5,
                "normal": 5,
                "warnings": 2,
                "critical": 3
              },
              "children": [],
              "type": "COLD_ROOM"
            }
          ]
        },
        {
          "id": "L01.02",
          "name": "CCS Distributors",
          "description": "",
          "children": [
            {
              "id": "L01.02.01",
              "name": "Distributor 1",
              "description": "",
              "level_summary": {
                "active": 4,
                "inactive": 5,
                "normal": 5,
                "warnings": 2,
                "critical": 3
              },
              "children": [
                {
                  "id": "L01.02.01.01",
                  "name": "Freezers",
                  "description": "",
                  "children": [],
                  "level_summary": {
                    "active": 4,
                    "inactive": 5,
                    "normal": 5,
                    "warnings": 2,
                    "critical": 3
                  }
                {
                  "id": "L01.02.01.02",
                  "name": "Cold Rooms",
                  "description": "",
                  "level_summary": {
                    "active": 4,
                    "inactive": 5,
                    "normal": 5,
                    "warnings": 2,
                    "critical": 3
                  },
                  "children": []
                }
              ]
            },
            {
              "id": "L01.02.02",
              "name": "Distributor 2",
              "description": "",
              "level_summary": {
                "active": 4,
                "inactive": 5,
                "normal": 5,
                "warnings": 2,
                "critical": 3
              },
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

`GET base_url/levels/{id}/summary`

```json
{
  "id": "L02.02",
  "name": "CSS New Cold Room 001",
  "type": "COLD_ROOM",
  "levels": [
    {
      "id": "L02.02.01",
      "name": "CICL Primary Distribution",
      "active": 4,
      "inactive": 5,
      "normal": 5,
      "warnings": 2,
      "critical": 3
    }
  ],
  "alerts": [
    {
        "level_id": "L02.02",
        "level_name" "ICL Primary Distribution",
        "sensors": [
          {
            "severity": "warning",
            "label": "temperature_sensor_01",
            "value": 100
          },
          {
            "severity": "critical",
            "label": "temperature_sensor_02",
            "value": 140
          }
        ]
    },
  ]
  "widget_url": "http://3.0.17.163:8080/d-solo/ae9ukan9xufpca/l01-01-01-01?orgId=1&from=1736676000000&to=1736681700000&timezone=browser&panelId=2&__feature.dashboardSceneSolo"
}
```

`POST base_url/sensors`

**Request Example:**
```json
{
  "sensor_type": "Temperature", // Temperature|Decibel|Energy|OEE
  "sub_type": "wialon", // wialon|teltonika|lorawan_4G (required for Temperature type)
  "configuration": {
    // For Temperature type with wialon sub-type
    "section_name": "string",
    "vehicle_no": "string",
    "unit_id": "string",
    "location_index": "string",

    // For Temperature type with teltonika sub-type
    "section_name": "string",
    "unit_id": "string",
    "location_index": "string",

    // For Temperature type with lorawan_4G sub-type
    "section_name": "string",
    "unit_id": "string",
    "unit_sub_id": "string",

    // For Decibel type
    "section_name": "string",
    "department": "string",
    "unit_id": "string"
  },
  "node": "2e5171d3-36e3-4805-850d-902c1b359943", // uuid of the node
  "thresholds": {
    "warning": "number",
    "critical": "number"
  }
}
```

**Request Format:**
- Content-Type: `application/json`
- Required fields:
  - `sensor_type`: Type of sensor (Temperature|Decibel|Energy|OEE)
  - `node`: UUID of the node where the sensor is installed
  - `thresholds`: Object containing warning and critical thresholds
- For Temperature type:
  - `sub_type`: Required (wialon|teltonika|lorawan_4G)
  - Configuration fields vary based on sub-type
- For Decibel type:
  - Configuration must include section_name, department, and unit_id

**Response Example:**
```json
{
  "data": {
    "id": "1",
    "sensor_type": "Temperature",
    "sub_type": "wialon",
    "configuration": {
      "section_name": "Section A",
      "vehicle_no": "VEH001",
      "unit_id": "UNIT001",
      "location_index": "LOC001"
    },
    "node": "2e5171d3-36e3-4805-850d-902c1b359943",
    "thresholds": {
      "warning": 25,
      "critical": 30
    },
    "status": "Active",
    "last_updated": "2024-03-20T10:30:00Z"
  }
}
```

**Error Responses:**
```json
{
  "error": "Invalid sensor type",
  "status": 400
}
```
```json
{
  "error": "Missing required configuration for sensor type",
  "status": 400
}
```
```json
{
  "error": "Invalid sub-type for Temperature sensor",
  "status": 400
}
```

`GET base_url/sensors`

**Response Example:**
```json
{
  "sensors": [
    {
      "id": "1",
      "sensor_type": "Temperature",
      "node": "2e5171d3-36e3-4805-850d-902c1b359943",
      "qube_device_id": "QUBE-001",
      "service_name": "Temp-Service-1",
      "service_type": "HTTP",
      "status": "Active",
      "last_updated": "2024-03-20T10:30:00Z"
    },
    {
      "id": "2",
      "sensor_type": "Energy",
      "node": "3f6282e4-47f4-5916-961e-013d2c470a54",
      "qube_device_id": "QUBE-002",
      "service_name": "Energy-Service-1",
      "service_type": "Modbus",
      "status": "Active",
      "last_updated": "2024-03-20T10:30:00Z"
    },
    {
      "id": "3",
      "sensor_type": "OEE",
      "node": "4g7393f5-58g5-6027-072f-124e3d581b65",
      "qube_device_id": "QUBE-003",
      "service_name": "OEE-Service-1",
      "service_type": "OPC UA",
      "status": "Inactive",
      "last_updated": "2024-03-20T10:30:00Z"
    }
  ]
}
```

**Response Fields:**
- `id`: Unique identifier for the sensor
- `sensor_type`: Type of sensor (Energy|Temperature|OEE)
- `node`: UUID of the node where the sensor is installed
- `qube_device_id`: Identifier of the Qube device
- `service_name`: Name of the service
- `service_type`: Type of service (HTTP|Modbus|OPC UA)
- `status`: Current status of the sensor (Active|Inactive)
- `last_updated`: Timestamp of the last update

**Query Parameters:**
- `type`: Filter sensors by type (Energy|Temperature|OEE)
- `node`: Filter sensors by node UUID
- `status`: Filter sensors by status (Active|Inactive)
- `limit`: Maximum number of sensors to return (default: 100)
- `offset`: Number of sensors to skip (default: 0)

**Example with Query Parameters:**
```
GET base_url/sensors?type=Temperature&status=Active&limit=10&offset=0
```

`GET base_url/sensors/{id}`

**Request:**
- Method: GET
- Path Parameter: `id` (required) - The ID of the sensor to retrieve

**Response Example:**
```json
{
  "data": {
    "id": "1",
    "sensor_type": "Temperature",
    "sub_type": "wialon",
    "configuration": {
      "section_name": "Section A",
      "vehicle_no": "VEH001",
      "unit_id": "UNIT001",
      "location_index": "LOC001"
    },
    "node": "2e5171d3-36e3-4805-850d-902c1b359943",
    "thresholds": {
      "warning": 25,
      "critical": 30
    },
    "status": "Active",
    "last_updated": "2024-03-20T10:30:00Z"
  }
}
```

**Error Response:**
```json
{
  "error": "Sensor not found",
  "status": 404
}
```

---

`PUT base_url/sensors/{id}`

**Request:**
- Method: PUT
- Path Parameter: `id` (required) - The ID of the sensor to update
- Content-Type: `application/json`

**Request Example:**
```json
{
  "sensor_type": "Temperature", // Temperature|Decibel|Energy|OEE
  "sub_type": "wialon", // wialon|teltonika|lorawan_4G (required for Temperature type)
  "configuration": {
    // For Temperature type with wialon sub-type
    "section_name": "string",
    "vehicle_no": "string",
    "unit_id": "string",
    "location_index": "string",

    // For Temperature type with teltonika sub-type
    "section_name": "string",
    "unit_id": "string",
    "location_index": "string",

    // For Temperature type with lorawan_4G sub-type
    "section_name": "string",
    "unit_id": "string",
    "unit_sub_id": "string",

    // For Decibel type
    "section_name": "string",
    "department": "string",
    "unit_id": "string"
  },
  "node": "2e5171d3-36e3-4805-850d-902c1b359943", // uuid of the node
  "thresholds": {
    "warning": "number",
    "critical": "number"
  }
}
```

**Response Example:**
```json
{
  "data": {
    "id": "1",
    "sensor_type": "Temperature",
    "sub_type": "wialon",
    "configuration": {
      "section_name": "Section A",
      "vehicle_no": "VEH001",
      "unit_id": "UNIT001",
      "location_index": "LOC001"
    },
    "node": "2e5171d3-36e3-4805-850d-902c1b359943",
    "thresholds": {
      "warning": 25,
      "critical": 30
    },
    "status": "Active",
    "last_updated": "2024-03-20T10:30:00Z"
  }
}
```

**Error Responses:**
```json
{
  "error": "Sensor not found",
  "status": 404
}
```
```json
{
  "error": "Invalid sensor type",
  "status": 400
}
```
```json
{
  "error": "Missing required configuration for sensor type",
  "status": 400
}
```
```json
{
  "error": "Invalid sub-type for Temperature sensor",
  "status": 400
}
```

---

`DELETE base_url/sensors/{id}`

**Request:**
- Method: DELETE
- Path Parameter: `id` (required) - The ID of the sensor to delete

**Response Example:**
```json
{
  "data": {
    "id": "1",
    "message": "Sensor deleted successfully",
  }
}

```

**Notes:**
- The sensor ID is required in the URL path
- Returns a success message with the deleted sensor ID and timestamp
- The operation is irreversible
- All associated data and configurations will be permanently removed

**Error Responses:**
```json
{
  "error": "Sensor not found",
  "status": 404
}
```
```json
{
  "error": "Cannot delete active sensor",
  "status": 400
}
```

---
## Node

`POST base_url/nodes`

**JSON Request Example:**

```json
{
  "name": "Node Name",
  "description": "Description",
  "parent_node": "2e5171d3-36e3-4805-850d-902c1b359943"
}
```
**Notes:**
- If parent_node is null then it is a top level node.

`GET base_url/nodes`

**Response Example:**

```json
{
  "data": [
    {
      "id": "2e5171d3-36e3-4805-850d-902c1b359944",
      "name": "Node Name",
      "description": "Description",
      "parent_node": "2e5171d3-36e3-4805-850d-902c1b359943"
    },
    {
      "id": "2e5171d3-36e3-4805-850d-902c1b359945",
      "name": "Node Name",
      "description": "Description",
      "parent_node": "2e5171d3-36e3-4805-850d-902c1b359941"
    }
  ]
}


`PUT base_url/nodes/{id}`

**Request Example:**

```json
{
  "name": "Node Name",
  "description": "Description",
  "parent_node": "2e5171d3-36e3-4805-850d-902c1b359943"
}
```

**Response Example:**

```json
{
  "data": {
    "id": "1",
    "name": "Level Name",
    "description": "Description",
    "parent_node": "2e5171d3-36e3-4805-850d-902c1b359943"
  }
}
```

**Notes:**
- If parent_node is null then it is a top level node.

`DELETE base_url/nodes/{id}`

**Request:**
- Method: DELETE
- Path Parameter: `id` (required) - The ID of the node to delete

**Response Example:**
```json
{
  "data": {
    "id": "1",
    "message": "Node deleted successfully",
  }
}
```

---

## 📘 Users & Roles

### 🧑‍💼 Authentication

* Users authenticate via **Azure Active Directory (Azure AD)**.
* Upon successful login, a **JWT token** is issued and used for accessing application APIs.
* All **authorization** (permissions & roles) is managed within the application.

---

## 🧑 Users

### `POST /users`

Create a new user and assign a role.

#### Request Body

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "role": "admin"
}
```

#### Response

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": {
    "id": "role-uuid",
    "name": "Admin"
  },
  "created_at": "2025-05-03T10:20:00Z"
}
```

---

`GET base_url/users`

**Response Example:**

```json
{
  "data": {[
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "User Name",
    "role": {
      "id": "role-uuid",
      "name": "Manager"
    }
  ]}
}
```

---

### `GET /users/{id}`

Get user details by ID.

**Request:**

```json
{
  "id": "user-uuid"
}
```

**Response:**

```json
{
  "id": "user-uuid",
  "email": "user@example.com",
  "name": "User Name",
  "role": {
    "id": "role-uuid",
    "name": "Manager"
  }
}
```

---

### `PUT /users/{id}`

Update user details.

**Request:**

```json
{
  "id": "user-uuid",
  "name": "Updated Name",
  "role_id": "new-role-uuid"
}
```

**Response:**

```json
{
  "data": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "Updated Name",
    "role_id": "new-role-uuid"
  }
}
```

## 🛡️ Roles

Roles are **customizable** and are assigned:

* A set of **actions** (permissions) per node
* Notification preferences (SMS, Email, MS Teams)
* Root access flag

Actions can be like:

#### Global Actions:
* `USER_CREATE`
* `USER_UPDATE`
* `USER_DELETE`
* `USER_VIEW`
* `REPORT_CREATE`
* `REPORT_UPDATE`
* `REPORT_VIEW`
* `REPORT_DELETE`
* `ROLE_CREATE`
* `ROLE_UPDATE`
* `ROLE_DELETE`
* `ROLE_ASSIGN`

#### Node Actions:
* `NODE_CREATE`
* `NODE_UPDATE`
* `NODE_DELETE`
* `NODE_VIEW`
* `SENSOR_CREATE`
* `SENSOR_UPDATE`
* `SENSOR_DELETE`
* `SENSOR_VIEW`
* `VIEW_SENSOR_DATA`
* `ACKNOWLEDGE_ALERT`

---

### `POST /roles`

Create a new role.

#### Request Body

```json
{
  "name": "Cold Room Operator",
  "description": "Role with access to cold room nodes only",
  "sms_enabled": true,
  "email_enabled": true,
  "ms_teams_enabled": false,
  "has_root_access": false,
  "role_actions": [
    {
      "node_id": "2e5171d3-36e3-4805-850d-902c1b359943",
      "actions": [
        "NODE_CREATE",
        "SENSOR_VIEW",
        "SENSOR_UPDATE"
      ]
    },
    {
      "node_id": "3f6282e4-47f4-5916-961e-013d2c470a53",
      "actions": [
        "NODE_CREATE"
      ]
    },
    {
      "node_id": "4g7393f5-58g5-6027-072f-124e3d581b65",
      "actions": [
        "SENSOR_CREATE"
      ]
    },
    {
      "node_id": null,
      "actions": [
        "REPORT_CREATE"
      ]
    },
    {
      "node_id": null,
      "actions": [
        "REPORT_VIEW"
      ]
    }
  ]
}
```

#### Response

```json
{
  "data": {
    "id": "role-uuid",
    "name": "Cold Room Operator",
    "description": "Role with access to cold room nodes only",
    "sms_enabled": true,
    "email_enabled": true,
    "ms_teams_enabled": false,
    "has_root_access": false,
    "role_actions": [
      {
        "node_id": "2e5171d3-36e3-4805-850d-902c1b359943",
        "actions": [
          "NODE_CREATE",
          "SENSOR_VIEW",
          "SENSOR_UPDATE"
        ]
      },
      {
        "node_id": "3f6282e4-47f4-5916-961e-013d2c470a53",
        "actions": [
          "NODE_CREATE"
        ]
      },
      {
        "node_id": "4g7393f5-58g5-6027-072f-124e3d581b65",
        "actions": [
          "SENSOR_CREATE"
        ]
      },
      {
        "node_id": null,
        "actions": [
          "REPORT_CREATE"
        ]
      },
      {
        "node_id": null,
        "actions": [
          "REPORT_VIEW"
        ]
      }
    ]
  }
}
```

**Notes:**
-if `has_root_access` is true, then the role will have access to all nodes.
-if node_id is null, then the role will globally have access to the action.

---

### `GET /roles`

Get all roles.

#### Response

```json
{
  "data": [
    {
      "id": "role-uuid",
      "name": "Cold Room Operator",
      "description": "Role with access to cold room nodes only",
      "sms_enabled": true,
      "email_enabled": true,
      "ms_teams_enabled": false,
      "has_root_access": false,
      "role_actions": [
        {
          "node_id": "2e5171d3-36e3-4805-850d-902c1b359943",
          "actions": [
            "NODE_CREATE",
            "SENSOR_VIEW",
            "SENSOR_UPDATE"
          ]
        }
      ]
    }
  ]
}
```

---

### `GET /roles/{id}`

Get details of a single role.

#### Response

```json
{
  "data": {
    "id": "role-uuid",
    "name": "Cold Room Operator",
    "description": "Role with access to cold room nodes only",
    "sms_enabled": true,
    "email_enabled": true,
    "ms_teams_enabled": false,
    "has_root_access": false,
    "role_actions": [
      {
        "node_id": "2e5171d3-36e3-4805-850d-902c1b359943",
        "actions": [
          "NODE_CREATE",
          "SENSOR_VIEW",
          "SENSOR_UPDATE"
        ]
      }
    ]
  }
}
```

---

### `PUT /roles/{id}`

Update a role.

#### Request Body

```json
{
  "name": "Updated Role Name",
  "description": "Updated Role Description",
  "sms_enabled": false,
  "email_enabled": true,
  "ms_teams_enabled": true,
  "has_root_access": true,
  "role_actions": [
    {
      "node_id": "2e5171d3-36e3-4805-850d-902c1b359943",
      "actions": [
        "NODE_CREATE",
        "SENSOR_VIEW",
        "SENSOR_UPDATE"
      ]
    }
  ]
}
```

#### Response

```json
{
  "data": {
    "id": "role-uuid",
    "name": "Updated Role Name",
    "description": "Updated Role Description",
    "sms_enabled": false,
    "email_enabled": true,
    "ms_teams_enabled": true,
    "has_root_access": true,
    "role_actions": [
      {
        "node_id": "2e5171d3-36e3-4805-850d-902c1b359943",
        "actions": [
          "NODE_CREATE",
          "SENSOR_VIEW",
          "SENSOR_UPDATE"
        ]
      }
    ]
  }
}
```

---

### `DELETE /roles/{id}`

Delete a role if not in use.

#### Response

```json
{
  "data": {
    "id": "role-uuid",
    "message": "Role deleted successfully"
  }
}
```

---

## 🔐 Authorization Model

Each **role** consists of:

* A **list of action items** (permissions per node)
* Notification preferences (SMS, Email, MS Teams)
* Root access flag

When a user logs in:

* Their **role** determines what actions they can perform on which nodes
* Their **notification preferences** determine how they receive alerts
* The **root access flag** determines if they have unrestricted access to all nodes

All access enforcement must check both action permission and node scope before granting access.


